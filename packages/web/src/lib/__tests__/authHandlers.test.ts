
import { useAuthHandlers } from '../authHandlers';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateEmail, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { auth } from '@/lib';
import { captureLogin, createGuide, createUpdateEmail as updateEmailFBRT } from '@/state';

jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updatePassword: jest.fn(),
}));
jest.mock('@/lib', () => ({
  auth: {},
}));
jest.mock('@/state', () => ({
  captureLogin: jest.fn(),
  createGuide: jest.fn(),
  createUpdateEmail: jest.fn(),
}));

describe('useAuthHandlers', () => {
  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    displayName: null,
    photoURL: null,
    phoneNumber: null,
    tenantId: null,
    refreshToken: '',
    providerId: '',
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls signOut on logout', async () => {
  (signOut as jest.Mock).mockResolvedValueOnce(undefined);
    const handlers = useAuthHandlers(mockUser);
    await handlers.logout();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it('calls signInWithEmailAndPassword and captureLogin on login', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce('user');
    (captureLogin as jest.Mock).mockImplementation(() => {});
    const handlers = useAuthHandlers(mockUser);
    await handlers.login('email', 'pass');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'email', 'pass');
    expect(captureLogin).toHaveBeenCalledWith('user');
  });

  it('calls createUserWithEmailAndPassword and createGuide on signup', async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({ user: mockUser });
    (createGuide as jest.Mock).mockImplementation(() => {});
    const handlers = useAuthHandlers(mockUser);
    await handlers.signup('email', 'pass');
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, 'email', 'pass');
    expect(createGuide).toHaveBeenCalledWith(mockUser);
  });

  it('calls updateEmail and updateEmailFBRT on updateEmail', () => {
    (updateEmail as jest.Mock).mockImplementation(() => {});
    (updateEmailFBRT as jest.Mock).mockImplementation(() => {});
    const handlers = useAuthHandlers(mockUser);
    handlers.updateEmail('new@email.com');
    expect(updateEmail).toHaveBeenCalledWith(mockUser, 'new@email.com');
    expect(updateEmailFBRT).toHaveBeenCalledWith(mockUser);
  });

  it('calls sendPasswordResetEmail on resetPassword', async () => {
    (sendPasswordResetEmail as jest.Mock).mockResolvedValueOnce(undefined);
    const handlers = useAuthHandlers(mockUser);
    await handlers.resetPassword('email');
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'email');
  });

  it('calls updatePassword on updatePassword', () => {
    (updatePassword as jest.Mock).mockImplementation(() => {});
    const handlers = useAuthHandlers(mockUser);
    handlers.updatePassword('pass');
    expect(updatePassword).toHaveBeenCalledWith(mockUser, 'pass');
  });

  it('returns correct form event handlers', () => {
    const setEmail = jest.fn();
    const setPassword = jest.fn();
    const setConfirm = jest.fn();
    const handlers = useAuthHandlers(mockUser);
    const formHandlers = handlers.getFormHandlers({ setEmail, setPassword, setConfirm });
    formHandlers.onChangeEmail({ target: { value: 'e' } } as any);
    formHandlers.onChangePassword({ target: { value: 'p' } } as any);
    formHandlers.onChangeConfirm({ target: { value: 'c' } } as any);
    expect(setEmail).toHaveBeenCalledWith('e');
    expect(setPassword).toHaveBeenCalledWith('p');
    expect(setConfirm).toHaveBeenCalledWith('c');
  });
});
