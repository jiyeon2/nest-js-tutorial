import React, {useContext, createContext, Dispatch, useReducer} from 'react';

export interface LoginUserState{
  username: string;
  email: string;
  isLoggedIn: boolean;
  accessToken: string;
}
const loginUserInitialState:LoginUserState ={
  username: '',
  email: '',
  isLoggedIn: false,
  accessToken: '',
}

const LoginUserContext = createContext<LoginUserState|undefined>(undefined);

type Action =
|{type: 'LOGIN'; username: string; email: string; isLoggedIn: boolean; accessToken: string;}
|{type: 'LOGOUT';};

type userLoginDispatch = Dispatch<Action>;

const UserLoginDispatchContext = createContext<userLoginDispatch|undefined>(undefined);

function loginUserReducer(state:LoginUserState, action: Action): LoginUserState {
  switch(action.type){
    case 'LOGIN':
      return {
        username: action.username,
        email: action.email,
        isLoggedIn: true,
        accessToken: action.accessToken
      }
    case 'LOGOUT':
      return loginUserInitialState
    default:
      throw new Error('unhandled action');
  }
}


export function LoginUserContextProvider({children}: {children: React.ReactNode}){
  const [userState, dispatch] = useReducer(loginUserReducer, loginUserInitialState)
  return (
    <UserLoginDispatchContext.Provider value={dispatch}>
      <LoginUserContext.Provider value={userState}>
      {children}
      </LoginUserContext.Provider>
    </UserLoginDispatchContext.Provider>
  )
}

export function useLoginUserState() {
  const state = useContext(LoginUserContext);
  if (!state) throw new Error('LoginUserContext not found');
  return state;
}

export function useUserLoginDispatch() {
  const dispatch = useContext(UserLoginDispatchContext);
  if (!dispatch) throw new Error('UserLoginDispatchContext not found');
  return dispatch;
}