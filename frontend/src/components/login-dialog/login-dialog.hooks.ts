import { useState, useCallback, useEffect } from 'react';
import { t } from '../../i18n';
import { ApiError } from '../../services/api';
import { useAuthContext } from '../../context/auth-context';

export const useLoginDialog = (open: boolean, onClose: () => void) => {
  const { login } = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setUsername('');
      setPassword('');
      setError(null);
    }
  }, [open]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t('dialogs.login.required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      onClose();
    } catch (err) {
      const wrong = err instanceof ApiError && err.status === 401;
      setError(t(wrong ? 'dialogs.login.wrongCredentials' : 'dialogs.login.failed'));
    } finally {
      setLoading(false);
    }
  }, [username, password, login, onClose]);

  return {
    username,
    password,
    error,
    loading,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
  };
};
