import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Header from '../Header.jsx';
import { fetchEvent, queryClient, deleteEvent } from '../../utlit/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false)
  const { data, isPending, isError, error } = useQuery({ queryKey: [`events`, id], queryFn: ({ signal }) => fetchEvent({ id, signal }) })
  const { mutate, isPending: isMuationPending, error: mutationError, isError: isMutationError  } = useMutation({
    mutationKey: [`events`, id], mutationFn: deleteEvent, onSuccess: () => {
      // refetchType: 'none' this to stop the refetching immediately after the delete
      // instead market just as outdated when we access the page use this query it will refetch by default cos it is marked as outdated
      // we do this here coz it is immediately call the current event which is deleted and return an error
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' })
      navigate('/events')
    }
  })
  let content;

  const handleDeleteEvent = () => { 
    mutate({ id })
  }
  const handleStartDeleting = () => { 
    setIsDeleting(true)
  }
  const handleStopDeleting = () => { 
    setIsDeleting(false)
  }
  if (isPending) { content = <div id="event-details-content"><p>Loading...</p></div> }
  if (isError) { content = <div id="event-details-content"><ErrorBlock title="An error occurred" message={error?.message || "Failed to fetch event"} /></div> }
  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    })
    content =
      <>
       <header>
          <h1>{data?.title}</h1>
          <nav>
          <button onClick={ handleStartDeleting }>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
  
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data.image}`} alt="" />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data?.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>{formattedDate}</time>
          </div>
          <p id="event-details-description">{data?.description}</p>
        </div>
      </div>
      </>
  }

  
  return (
    <>
      {isDeleting && <Modal onClose={handleStopDeleting}>
        <h2>Are you sure?!</h2>
        <p>are you sure you really want to delete this event?</p>
        {!isMutationError && <div className="form-actions">
          <button className="button-text" onClick={handleStopDeleting}>Cancel</button>
          {!isMuationPending ? <button className="button" onClick={handleDeleteEvent}>Delete</button> : <p>Please wait, is Deleting...</p>}
        </div>}
        {isMutationError && <ErrorBlock title="An error occurred" message={mutationError?.message || "Failed to delete event"} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
       {content}
      </article>
    </>
  );
}
