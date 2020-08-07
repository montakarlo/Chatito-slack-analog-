import { createRoutine } from 'redux-saga-routines';

const addNewUserRoutine = createRoutine('ADD_NEW_USER');
const fetchUserRoutine = createRoutine('FETCH_USER');
const loginUserRoutine = createRoutine('LOGIN_USER');
const editProfileRoutine = createRoutine('EDIT_PROFILE');

export { addNewUserRoutine, fetchUserRoutine, loginUserRoutine, editProfileRoutine };
