import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { fetchEvents } from '../../utlit/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';


export default function FindEventSection() {
  const searchElement = useRef();
  const [searchTerm, setSearchTerm] = useState();  
  const { data, isError, isPending, isLoading, error } = useQuery({
    queryKey: ['events', { search: searchTerm, max: 3 }],
    queryFn: ({ signal, queryKey } ) => fetchEvents({ signal, ...queryKey[1], ...queryKey[2] }),
    enabled: searchTerm !== undefined, // this one by default is true we can stop featching if the user not search yet "in the first time visting the page"
  })
  //isPending: always is true if the data is undefined so if we didn't run our query yet we need to use isloading
  //isLoading: it will be true just if it is really in the loading phase

  let content = <p>Please enter a search term and to find events.</p>

  if (isError) { 
    content = <ErrorBlock title="An error occurred" message={error?.info?.message || "Failed to fetch events"} />
  }

  if (isLoading) { 
    content = <LoadingIndicator />
  }

  if (data) { 
    content = <ul className="events-list">
      {data.map((event) => (
        <li key={event.id }><EventItem  event={event} /></li>
      ))}
    </ul>
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
