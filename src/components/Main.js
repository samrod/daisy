import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Display from './Display';
import Remote from './Remote';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Display}></Route>
      <Route exact path='/remote' component={Remote}></Route>
    </Switch>
  );
}

export default Main;
