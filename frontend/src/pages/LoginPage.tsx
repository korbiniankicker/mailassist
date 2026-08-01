import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../api/context/AuthContext';

export default function LoginPage({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const isRegister = mode === 'register';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [imapHost, setImapHost] = useState('');
  const [imapPort, setImapPort] = useState('993');
  const [imapUser, setImapUser] = useState('');
  const [imapPass, setImapPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailFields, setShowEmailFields] = useState(false);

  const emailFields = (
    <>
      <div className="mb-3 mt-2">
        <input
          type="text"
          className="form-control"
          placeholder="IMAP host (e.g. imap.example.com)"
          value={imapHost}
          onChange={(e) => setImapHost(e.target.value)}
          required={isRegister}
        />
      </div>
      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="IMAP port (default 993)"
          value={imapPort}
          onChange={(e) => setImapPort(e.target.value)}
          required={isRegister}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Email username"
          value={imapUser}
          onChange={(e) => setImapUser(e.target.value)}
          required={isRegister}
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Email password"
          value={imapPass}
          onChange={(e) => setImapPass(e.target.value)}
          required={isRegister}
        />
      </div>
    </>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const emailCredentials =
        imapHost && imapUser && imapPass
          ? {
              host: imapHost,
              port: Number(imapPort || 993),
              username: imapUser,
              password: imapPass,
            }
          : undefined;
      if (isRegister) {
        await register(username, password, emailCredentials);
      } else {
        await login(username, password, emailCredentials);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card col-10 col-sm-6 col-md-4 col-lg-3 p-4">
        <div className="text-center mb-4">
          <img src="/logo.png" alt="Logo" className="col-8 mb-3" />
          <h5>{isRegister ? 'Create Account' : 'Sign In'}</h5>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <hr />

          {isRegister ? (
            <>
              <small className="text-body-secondary">
                Email credentials (used to fetch your emails)
              </small>
              {emailFields}
            </>
          ) : (
            <div className="mb-3">
              <button
                type="button"
                className="btn btn-outline-secondary w-100 text-start"
                onClick={() => setShowEmailFields(!showEmailFields)}
                aria-expanded={showEmailFields}
              >
                <span className="d-flex justify-content-between align-items-center">
                  <span>
                    Email credentials{' '}
                    <span className="text-body-secondary">(optional)</span>
                  </span>
                  <i className={`bi bi-chevron-${showEmailFields ? 'up' : 'down'}`} />
                </span>
              </button>
              <div className={showEmailFields ? '' : 'd-none'}>
                <small className="text-body-secondary d-block mt-2">
                  Leave empty to keep your saved email credentials. If filled in,
                  these will replace your saved credentials.
                </small>
                {emailFields}
              </div>
            </div>
          )}

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>
            {loading ? 'Please wait…' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <Link className="btn btn-link w-100" to={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
        </Link>
      </div>
    </div>
  );
}
