import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useMyContext } from "../../store/ContextApi";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setIsAdmin } = useMyContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    localStorage.removeItem('CSRF_TOKEN');

    if (token && params.get('twoFactorRequired') === 'true') {
      navigate('/login', { replace: true, state: { pending2faToken: token } });
    } else if (token) {
      try {
        const decodedToken = jwtDecode(token);

        localStorage.setItem('JWT_TOKEN', token);

        const user = {
          username: decodedToken.sub,
          roles: decodedToken.roles.split(','),
        };
        localStorage.setItem('USER', JSON.stringify(user));

        setToken(token);
        setIsAdmin(user.roles.includes('ROLE_ADMIN'));

        navigate('/notes', { replace: true });
      } catch (error) {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, navigate, setToken, setIsAdmin]);

  return <div>Redirecting...</div>;
};

export default OAuth2RedirectHandler;
