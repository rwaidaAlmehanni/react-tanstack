import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import { createNewEvent, queryClient } from '../../utlit/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';


export default function NewEvent() {
  // we can use useQuery also to do POST or PUT requests coz we add our own logic but using useMutation is better coz it trigger just when we do an action but useQuery is trigger by default  
  const navigate = useNavigate();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: createNewEvent, onSuccess: () => { 
      //this function will looking for the query that has the key 'events' and refetch this query but will seach on each query start with this string and 
      // reexecute this query if we need just the exact query we need to add exact key
      queryClient.invalidateQueries({ queryKey: ['events'], exact: true })
      navigate('/events')
     } })

  function handleSubmit(formData) {
    mutate({ event: formData })
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <p>Submitting...</p>}
        <>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Create
          </button>
        </>
      </EventForm>
      {isError && <ErrorBlock title="An error occurred" message={error?.info?.message || "Failed to create event"} />}
    </Modal>
  );
}
