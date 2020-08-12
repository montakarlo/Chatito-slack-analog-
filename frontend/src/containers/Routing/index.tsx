import React, { useEffect } from 'react';
import { Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { IBindingAction } from 'common/models/callback/IBindingActions';
import { IAppState } from 'common/models/store';
import { Routes } from 'common/enums/Routes';
import { getAccessToken } from 'common/helpers/storageHelper';
import LoaderWrapper from 'components/LoaderWrapper';
import PublicRoute from '../PublicRoute';
import PrivateRoute from '../PrivateRoute';
import { fetchUserRoutine } from 'routines/user';
import AddWorkspace from 'scenes/Workspace/containers/AddWorkspace';
import PageNotFound from 'scenes/PageNotFound/index';
import Workspace from 'scenes/Workspace/containers/Workspace';
import Auth from 'scenes/Auth/containers/Auth';
import JoinInvitedWorkspace from 'containers/JoinInvitedWorkspace';
import { IWorkspace } from 'common/models/workspace/IWorkspace';
import { IFetchUser } from 'common/models/fetch/IFetchUser';

interface IProps {
  isLoading: boolean;
  isAuthorized: boolean;
  workspace: IWorkspace;
  fetchUser: IBindingCallback1<IFetchUser>;
}

const Routing: React.FC<IProps> = ({
  isLoading,
  isAuthorized,
  workspace,
  fetchUser
}) => {
  const hasToken = Boolean(getAccessToken());

  useEffect(() => {
    if (hasToken && !isAuthorized && !isLoading) {
      const payload = {
        workspace
      };
      fetchUser(payload);
    }
  });

  return (
    <LoaderWrapper loading={isLoading || (hasToken && !isAuthorized)}>
      <Switch>
        <PublicRoute path={Routes.Auth} component={Auth} />
        <PublicRoute path={Routes.JoinInvitedWorkspace} component={JoinInvitedWorkspace} />
        <PrivateRoute exact path={Routes.Workspace} component={Workspace} />
        <PrivateRoute exact path={Routes.AddWorkspace} component={AddWorkspace} />
        <PrivateRoute path={Routes.NotExistingPath} component={PageNotFound} />
      </Switch>
    </LoaderWrapper>
  );
};

const mapStateToProps = (state: IAppState) => {
  const { user: { isLoading, isAuthorized }, workspace } = state;
  return {
    isLoading,
    isAuthorized,
    workspace: workspace.workspace
  };
};

const mapDispatchToProps = {
  fetchUser: fetchUserRoutine
};

export default connect(mapStateToProps, mapDispatchToProps)(Routing);
