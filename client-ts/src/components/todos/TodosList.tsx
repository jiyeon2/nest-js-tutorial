import React, {useState} from 'react';
import {Todo} from './TodosPage';
import {
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Checkbox,
  Button
} from '@material-ui/core';

export function TodosList(props:{todos: Todo[]}):JSX.Element{
  const {todos} = props;
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const handleToggle = (value: string) => () => {
    const currentIndex = checkedIds.indexOf(value);
    const newCheckedIds = [...checkedIds];

    if (currentIndex === -1){
      newCheckedIds.push(value);
    } else {
      newCheckedIds.splice(currentIndex, 1);
    }

    setCheckedIds(newCheckedIds);
  }

  function deleteTodos(){
    // checkedIds 삭제 요청
    // 완료 후 loadTodo
  }

  return (
    <div>
      <Button 
      variant="contained" 
      onClick={deleteTodos}
      color="secondary"
      >삭제</Button>
    <List dense>
    {todos.map(todo => {
      const {id, name, description} = todo;
      const labelId = `checkbox-list-label-${id}`;
      return (
        <ListItem key={id} button>
          <ListItemText 
            id={labelId}
            primary={name} 
            secondary={description}
          />
          <ListItemSecondaryAction>
            <Checkbox
              edge="end"
              onChange={handleToggle(id)}
              checked={checkedIds.indexOf(id) !== -1}
              inputProps={{'aria-labelledby': labelId}}
            />
          </ListItemSecondaryAction>
        </ListItem>
      )
    })}
    </List>
    </div>
  )
}