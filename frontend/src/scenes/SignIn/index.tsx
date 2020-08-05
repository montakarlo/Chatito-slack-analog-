import React, { FunctionComponent } from 'react';
import { Formik, Form } from 'formik';
import styles from './styles.module.sass';
import { login } from '../../services/authService';
import { setAccessToken } from '../../common/helpers/storageHelper';
import InputField from '../../components/InputField/InputField';
import { signInValSchema as validationSchema } from '../../common/models/formik/ValSchema';
import { IUserInput } from '../../common/models/signIn-signUp/user';
import { fetchUserRoutine } from '../../routines/user';
import { connect } from 'react-redux';
import { Routine } from 'redux-saga-routines';

interface IProps {
  fetchUser: Routine;
}

const SignIn: FunctionComponent<IProps> = ({ fetchUser }) => {
  const onSubmit = async (values: IUserInput,
    { setSubmitting }: { setSubmitting: Function }) => {
      const { email, password } = values;
      const mappedValues = {
        email,
        password
      };
      const payload = {
        payload: mappedValues
      };
      fetchUser(payload);
      setSubmitting(false);
  };
  const initialValues = {
    email: '',
    password: ''
  };

  return (
    <div className={styles.signIn}>
      <h1 className="text-center p-5">Sign in</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form className="signIn-form d-flex flex-column justify-content-center align-items-center">
          <InputField
            label="Email:"
            name="email"
            type="email"
            placeholder="example@gmail.com"
          />
          <InputField
            label="Password:"
            name="password"
            type="password"
          />

          <div className="form-group">
            <button type="submit" className="btn btn-primary mr-2">
              Sign In
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

const mapDispatchToProps = {
  fetchUser: fetchUserRoutine
};

export default connect(
  null,
  mapDispatchToProps
)(SignIn);
