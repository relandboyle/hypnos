import React from 'react';
import { graphql } from 'react-apollo';
import { useStateValue } from '../Context';
// NOTE: moved endpoint field to inside query
import EndpointField from '../Components/EndpointField';
import QueryOutputDisplay from '../Components/QueryOutputDisplay';
import QueryInput from '../Components/QueryInput';

const QueriesContainer = () => {
  const [
    {
      endpoint, query, queryResultObject, queryGQLError,
    }, dispatch,
  ] = useStateValue();

  // error thrown because it evals before anything is in query
  let OutputOfQuery;
  if (query !== '') {
    // if something is in query, assign QQO to output of query
    // had to pass on props with the props object. it "parses" bigass object
    // before it's passed on. one thing needed for dynamism: the name of the prop
    // on the data object. e.g. query luke { !!!PERSON }
    OutputOfQuery = graphql(query, {
      props: ({ data }) => {
        console.log(data, 'this is data inside output of query');
        // console.log(query, 'this is query inside output of query')
        if (data.loading) {
          return {
            loading: data.loading,
          };
        }
        if (data.error) {
          console.log('error is ', data.error);
          return {
            error: data.error,
          };
        }
        const resultObj = {
          loading: false,
        };
        resultObj[queryResultObject] = data[queryResultObject];
        return resultObj;
      },
    })(QueryOutputDisplay);
  }


  // NOTE: moved endpoint field to inside query
  return (
    <section id="queries-container">
      <QueryInput />
      <article id="query-output">
        {query !== '' && <OutputOfQuery query={query} />}
        {/* NOTE: ERRORS ARE MOSTLY BEING RENDERED HERE, NOT INSIDE QUERY OUTPUT DISPLAY  */}
        {queryGQLError !== '' && <h4>{queryGQLError}</h4>}
      </article>
    </section>

  );
};

export default QueriesContainer;
