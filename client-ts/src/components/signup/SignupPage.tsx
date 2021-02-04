import React, {useState, useRef} from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import { Button, LinearProgress, Container} from '@material-ui/core';
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
  const [authCode, setAuthCode] = useState<string>('');

  const requireAuthMail = (email:string) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    axios.post(
      'http://localhost:4000/auth/send-user-auth-email',
      {email})
    .then(res => {
      const {authCode, message} = res.data;
      console.log({message, authCode});
      alert(`인증 코드가 ${email} 로 발송되었습니다. \n인증코드 확인 후 회원가입이 가능합니다`);
      setAuthCode(authCode);
      setInputVisible(true);
    })
    .catch(e => console.error(e));
    
  }

  const checkDuplicateUsername = (username:string) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    axios.post(
      'http://localhost:4000/users/check-username',
      {username}
      ).then(res => {
        const exist = res.data;
        if (!exist){
          alert('해당 username은 사용 가능합니다')
        } else {
          alert('해당 username은 사용이 불가능합니다. 다른 이름을 사용해주세요')
        }
      })
      .catch(error => {
        console.error(error)
        alert('오류가 발생했습니다 다시 시도해주세요')
      }); 
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
        username: Yup.string().min(3, 'more than 3 characters').max(15, 'Must be 15 characters or less').required('Required'),
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string()
        .required('Please Enter your password')
        .matches(
          /[A-Za-z\d@$!%*#?&]{4,}$/,
          "Must Contain 4 Characters. @$!%*#?& and alphanumeric available"
        ),
        passwordConfirm: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        code: Yup.string()
        .required('이메일로 전송된 인증코드를 입력해주세요')
        .matches(new RegExp(authCode), '인증코드가 일치하지 않습니다...')
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
      {({ submitForm, isSubmitting, values, errors }: FormikProps<Values>) => (
        <Form className={classes.form}>
          <Field component={TextField} name="username" type="text" label="User name"/>
          <Button variant="contained"  
            onClick={checkDuplicateUsername(values.username)}
            disabled={errors.username || !values.username ? true: false}
          >중복 유저네임 확인</Button> 
          <Field component={TextField} name="password" type="password" label="Password" />
          <Field component={TextField} type="password" label="PasswordConfirm" name="passwordConfirm" />
          <Field component={TextField} name="email" type="email" label="Email"/>
          <Button variant="contained"  
            onClick={requireAuthMail(values.email)}
            disabled={errors.email || !values.email ? true: false}
          >인증 메일 받기</Button> 
          {
            inputVisible
            ? (
              <>
              <Field component={TextField} name="code" type="text" label="인증코드" />
              <Button variant="contained">인증 코드 확인하기</Button>
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