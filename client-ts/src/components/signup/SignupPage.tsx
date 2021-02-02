import React, {useState, useRef} from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import { Button, LinearProgress, Container, Box } from '@material-ui/core';
import {makeStyles, createStyles, Theme} from '@material-ui/core/styles';
import { TextField } from 'formik-material-ui';
import * as Yup from 'yup';
import axios from '../../util/axiosInstance';

const useStyles = makeStyles((theme:Theme) => createStyles({
  form: {
    '&>*': {
      width: '100%',
      marginBottom: theme.spacing(2)
    }
  },
}))

//Formik tutorial - yup: https://formik.org/docs/tutorial 
interface Values {
  username: string;
  email: string;
  code: string;
  password: string;
  passwordConfirm: string;
}
// 참고한 폼 : https://compogetters.tistory.com/55?category=854053
export function SignupPage():JSX.Element{
  const classes = useStyles();
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const authCodeFromServer = useRef<string>('');
  const [finishAuth, setFinishAuth] = useState<boolean>(false);

  function requireAuthMail() {
    // 인증메일 요청하기
    axios.post('http://localhost:4000/auth/send-user-auth-email',{
      // email:
    })
    .then(res => console.log(res))
    .catch(e => console.error(e));
    setInputVisible(true);
  }

  function checkDuplicateUsername(){
    console.log('중복 유저네임 확인');
  }

  return (
    <Container maxWidth="sm">
      <h3>회원가입</h3>
      <Formik
      initialValues={{
        username:'',
        email: '',
        code:'',
        password: '',
        passwordConfirm: ''
      }}
      validationSchema={
        Yup.object({
        username: Yup.string().min(4, 'more than 4 characters').max(15, 'Must be 15 characters or less').required('Required'),
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string()
        .required('Please Enter your password')
        .matches(
          /[A-Za-z\d@$!%*#?&]{8,}$/,
          "Must Contain 8 Characters. @$!%*#?& and alphanumeric available"
        ),
        passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        })
      }
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          setSubmitting(false);

          if (finishAuth){
            alert(JSON.stringify(values, null, 2));
          } else {
            alert('이메일 인증이 완료되지 않았습니다, 이메일 인증을 완료해주세요');
          }
        }, 500);
      }}
      >
      {({ submitForm, isSubmitting }: Partial<FormikProps<Values>>) => (
        <Form className={classes.form}>
          <Field component={TextField} name="username" type="text" label="User name"/>
          <Button variant="contained"  onClick={checkDuplicateUsername}>중복 유저네임 확인</Button> 
          <Field component={TextField} name="password" type="password" label="Password" />
          <Field component={TextField} type="password" label="PasswordConfirm" name="passwordConfirm" />
          <Field component={TextField} name="email" type="email" label="Email"/>
          <Button variant="contained"  onClick={requireAuthMail}>인증 메일 받기</Button> 
          {
            inputVisible
            ? (
              <>
              <Field component={TextField} name="code" type="text" label="인증코드" />
              <Button variant="contained">인증 코드 전송</Button>
              </>
              ): null
          }
         
          
          {isSubmitting && <LinearProgress />}
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            onClick={submitForm}
          >
            Submit
          </Button>
        </Form>
      )}
    </Formik>
    </Container >
  );
}