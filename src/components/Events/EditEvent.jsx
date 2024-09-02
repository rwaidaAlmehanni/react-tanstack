import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { fetchEvent, queryClient } from '../../utlit/http.js'

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isPending } = useQuery({ queryKey: [`events`,id], queryFn: ({ signal }) => fetchEvent({ id, signal }) })
  const { mutate } = useMutation({
    mutationFn: fetchEvent, onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`events`, id], exact: true })
      navigate('../')
    },
    onMutate: async(data) => { 
      const newEvent = data.event
      // in this function we can add our logic for updating process
      await queryClient.cancelQueries({ queryKey: [`events`, id] }) // to don't query while mutate
      const prevData = queryClient.getQueriesData({ queryKey: [`events`, id] })
      queryClient.setQueriesData([`events`, id], newEvent ) // our new data before we get anu update from the backend it will change manually in cache data
      return { prevData }
    },
    onError: (error, newEvent, context) => { 
      queryClient.setQueryData([`events`, id], context?.prevData )
    },
    onSettled: () => { 
      queryClient.invalidateQueries({ queryKey: [`events`, id] })
    }
  })
  function handleSubmit(formData) {
    mutate({ event: formData, id })
  }

  function handleClose() {
    navigate('../');
  }

  return (
    <Modal onClose={handleClose}>
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    </Modal>
  );
}
