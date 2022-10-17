import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';
import {
  MDBBtn,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBInput,
  MDBRow,
  MDBModal,
  MDBModalBody,
  MDBModalHeader,
  MDBModalFooter,
} from 'mdbreact';
import { Event } from './Event';
import '../index.css';

import getWeb3 from "../utils/getWeb3";
import Tasks from "../abis/Tasks.json";

function convertJsonToString (json) {
  return JSON.stringify(json);
}

function convertStringToJson (string) {
  return JSON.parse(string);
}

function App() {

  const [todoState, setTodoState] = useState({
    web3: null,
    instance: null,
    account: "",
  });
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);

  const init = async () => {
    const web3 = getWeb3();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Tasks.networks[networkId];

    let _instance = new web3.eth.Contract(Tasks.abi, deployedNetwork.address);

    const account = _instance.givenProvider.selectedAddress;

    setTodoState({ web3, instance: _instance, account });
    
    if (_instance) {
      const _task = await _instance.methods.getTasks().call();
      setTodos(_task);
    }
  };

  useEffect(() => {
    init();
  }, [loading]);

  const onAddToDo = async () => {
    setLoading(true);
    await todoState.instance.methods
      .setTasks(convertJsonToString(data))
      .send({ from: todoState.account })
      .then((res) => {
        console.log("res :>> ", res);
        setLoading(false);
      });
  };

  const [data, setData] = useState({
    id: 0,
    title: '',
    description: '',
    time: '',
    location: '',
  });
  const [modal, setModal] = useState(false)
  const [events, setEvents] = useState([])

  const changeHandler = (e) => {
    setData({...data, [e.target.name]:[e.target.value]})
  }

  function addEvent() {
    const newArray = [...events];

    const {title, description, time, location} = data;

    newArray.push({
      id: newArray.length ? newArray[newArray.length - 1].id + 1 : 1,
      time,
      title,
      location,
      description
    });

    setEvents(newArray)

    setData({...data, id : 0})
    setData({...data, title : ""})
    setData({...data, description : ""})
    setData({...data, time : ""})
    setData({...data, location : ""})
  }

  function handleDelete(eventId) {
    const filteredEvents = events.filter(e => e.id !== eventId);
    setEvents(filteredEvents);
  }

  function toggleModal() {
    setModal(!modal)
  }

  const mEvents = events.map( e => (
    <Event
      key={e.id}
      id={e.id}
      title={e.title}
      time={e.time}
      location={e.location}
      description={e.description}
      onDelete={handleDelete}
    />
  ));

  return !todoState && !todoState.contract ? (
    <div>Loading Web3, accounts, and contract...</div>
  ) : (
    <>
      <MDBContainer className="mt-5">
        <h2 className="text-uppercase my-3">Agenda do dia:</h2>
        <MDBRow>
          <MDBCol md="9">
            {mEvents}
            <MDBRow className="mb-4">
              <MDBCol xl="3" md="6" className="mx-auto text-center">
                <MDBBtn color="info" onClick={toggleModal} rounded>
                  Adicionar tarefa
                </MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCol>
          <MDBCol md="3">
            <h3 className="text-uppercase my-3">Cronograma</h3>
            <h6 className="my-3">
            Você tem
              {' '}
              <b>
                {events.length}
                {' '}
                eventos
                {' '}
              </b>
              {' '}
              hoje!
            </h6>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <MDBModal isOpen={modal} toggle={toggleModal}>
        <MDBModalHeader
          className="text-center"
          titleClass="w-100 font-weight-bold"
          toggle={toggleModal}
        >
          Adicionar tarefa
        </MDBModalHeader>
        <MDBModalBody>
          <form className="mx-3 grey-text">
            <MDBInput
              name="time"
              label="Hora"
              icon="clock"
              hint="HH:MM"
              group
              type="text"
              onChange={changeHandler}
            />
            <MDBInput
              name="title"
              label="Título"
              icon="edit"
              hint="Resumo"
              group
              type="text"
              onChange={changeHandler}
            />
            <MDBInput
              name="location"
              label="Local (Opcional)"
              icon="map"
              group
              type="text"
              onChange={changeHandler}
            />
            <MDBInput
              name="description"
              label="Descrição (Opcional)"
              icon="sticky-note"
              group
              type="text"
              onChange={changeHandler}
            />
          </form>
        </MDBModalBody>
        <MDBModalFooter className="justify-content-center">
          <MDBBtn
            color="info"
            onClick={() => {
              toggleModal();
              addEvent();
              onAddToDo();
            }}
          >
            Cadastrar
          </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </>
  );
}

export default App;
