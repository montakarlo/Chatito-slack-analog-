export enum Routes {
  BaseUrl = '/',
  Auth = '/auth/:page',
  SignUp = '/auth/signup',
  SignIn = '/auth/signin',
  ForgotPassword = '/auth/forgot',
  ResetPassword = '/auth/reset/:token',
  Profile = '/profile',
  Workspace = '/w/:whash',
  WorkspaceWithChat = '/w/:whash/c/:chash',
  AddWorkspace = '/add-workspace',
  JoinInvitedWorkspace = '/invite/:token',
  Room = '/room',
  Channel = '/channel/:name',
  Direct = '/direct',
  NotExistingPath = '/404',
  Maintenance='/maintenance'
}
