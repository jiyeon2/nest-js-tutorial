import React,{useRef} from 'react';
import {Button} from '@material-ui/core';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import axios from '../../util/axiosInstance';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }),
);

export function UnblockRequest(){
  const classes = useStyles();
  const emailRef = useRef<HTMLInputElement|null>(null);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>){
    event.preventDefault();
    if (emailRef.current){
      try{
        const email = emailRef.current.value; // 유효성 검사 후 제출여부 결정해야함
        console.log({email});
        const response = await axios.post('http://localhost:4000/auth/send-reset-password-email',
        { email});
        console.log(response.data);
        
      } catch(e) {
        console.error(e.response);
        if (e.response.status === 500){
          // 서버내부오류, 혹은 다른 이유
          alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요')
        } else{
          alert('해당 email로 가입된 유저가 없습니다'); 
        }
      } finally{
        // emailRef.current.value = '';
      }
    }
  }
  return (
    <section>
       <div className={classes.root}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography variant="h3" className={classes.heading}>
          비밀번호를 틀려서 로그인이 안된다면
            </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div>
          <Typography>
          이메일로 본인인증 후 비밀번호 초기화하기
          </Typography>
          <form>
            <label htmlFor="name">이메일 : </label>
            <input type="email" name="email" required ref={emailRef} />
            <Button type="submit" onClick={handleClick}>입력</Button>
          </form>
          </div>
          
        </AccordionDetails>
      </Accordion>
    </div>
    </section>
  );
}