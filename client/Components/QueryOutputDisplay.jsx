import React from 'react';
import { useStateValue } from '../Context';
import { jsonFormatter } from '../utils/jsonFormatter';
import nullChecker from '../utils/nullChecker';
import nullResultChecker from '../utils/nullResultChecker';

const QueryOutputDisplay = (props) => {
  // ! TODO: MOVE ERROR CHECKING INTO A DIFFERENT FILE BECAUSE THIS IS A LOT
  const [{ queryResultObject, queryGQLError }] = useStateValue();
  // pull props off from GQL query running
  const { loading, error } = props;
  // result is assigned either the successful query data or an error string
  const result = props[queryResultObject] ? props[queryResultObject] : queryGQLError;

  // checking if __typeName on the result object exists. If it doesn't, we send an error message
  if (loading === false && !Object.keys(result).includes('__typename')) return <p className="error">Query does not have a properly formatted type within @rest.</p>;

  // checking to see if there are any null values on the results object
  // if so, means that the query field was improperly named or doesn't exist

  // ! NOTE: Only checks one level. need to do recursive check for nested nulls
  const testNull = nullChecker(result);
  let nullVals;
  // if there is a null value in successful query, build LIs that display null props in query
  if (testNull) {
    nullVals = nullResultChecker(result);
    // nullVals = Object.keys(result).reduce((acc, curVal) => {
    //   if (result[curVal] === null) {
    //     acc.push(
    //       <li>
    //         {curVal}
    //       </li>,
    //     );
    //   }
    //   return acc;
    // }, []);
  }

  // checking if there are any values from our result that look like a url (surface level only)
  let urlAsPropCheck = false;
  // result will either be an object or string (error message)
  if (typeof result === 'object') {
    // ensures curVal is not null and that it is a string. a URL-like response
    // will only be a string
    urlAsPropCheck = Object.values(result).reduce((acc, curVal) => {
      if (curVal !== null && typeof curVal === 'string') return curVal.includes('http') || acc;
      return acc;
    }, false);
  }

  // if there are any values from our result that look like a url, make an array of LIs
  let urlPropNames;
  if (urlAsPropCheck) {
    urlPropNames = Object.keys(result).reduce((acc, curVal) => {
      if (typeof result[curVal] === 'string' && result[curVal].includes('http')) {
        acc.push(
          <li>
            {curVal}
          </li>,
        );
      }
      return acc;
    }, []);
  }


  // loading and error cases do not have query-output IDs
  // loading and error come from GraphQL query result
  if (loading) {
    return (<div className="lds-circle"><div /></div>);

    // return (<></>);
  }

  // need to figure out how to deal with this one -- 7/30 at 11:00 am
  // if (error.message === 'Network error: forward is not a function')

  // any error from a graphql query that's not already accounted for is rendered here
  if (error) {
    if (error.message === 'Network error: forward is not a function') {
      return (<p className="error">Query submitted did not have '@rest' formatted correctly. For an example, press 'reset' and refer to line 3.</p>);
    }
    return (<p className="error">{error.message}</p>);
  }

  // NOTE: If this is true, then successful query results will now be shown at all, which is OK.
  if (testNull) {
    return (
      <article>
        <p font="helevtica" className="error">
          Null values returned from query. Please check these properties:
          <br />
          <br />
        </p>
        <ul font="helevtica">
          {nullVals}
        </ul>
      </article>
    );
  }


  return (
    <>
      <article>
        <pre>
          <code>
            {jsonFormatter(result)}
          </code>
        </pre>
        <br />
        <br />
        <>
          {urlAsPropCheck
            ? (
              <article>
                <p className="error">
                  Note: The following data on the prop(s) below resemble a URL. If it is, you will have to reformat your query to access data at that API:
                  <br />
                  <br />
                </p>
                <ul>
                  {urlPropNames}
                </ul>
              </article>
            )
            : ''}
        </>
      </article>
    </>
  );
};


export default QueryOutputDisplay;
