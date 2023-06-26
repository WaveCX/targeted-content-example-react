import {useEffect, useState} from 'react';
import {
  initialize as initializeWaveCx,
  setUser as setWaveCxUser,
  setContext,
  clearContext,
} from '@wavecx/targeted-content';

import {hashUserId} from './hash-user-id';

import styles from './main.module.css';

const apiBaseUrl = process.env['REACT_APP_API_BASE_URL'];
const orgCode = process.env['REACT_APP_ORG_CODE'];

const views = [
  'account-view',
  'payments',
  'no-trigger-point-page',
];

const triggerPointForView = (view: string): string | undefined => {
  if (view !== 'no-trigger-point-page') {
    return view;
  }
}

export const Main = () => {
  const [userId, setUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [view, setView] = useState(views[0]);

  useEffect(() => {
    // initialize WaveCX
    initializeWaveCx({
      organizationCode: orgCode ?? '', // organization code for the WaveCX account you are integrating with
      apiBaseUrl, // defaults to production API
      contentTypes: ['featurette'], // only featurette content is relevant for feature tour
      platform: 'desktop', // mobile | desktop
      buttonClassName: styles.triggerButton, // apply custom classes to UI elements
      viewClassName: styles.viewContainer,
    })
  }, []);

  useEffect(() => {
    // pass user ID and verification to WaveCX upon authentication
    setWaveCxUser({id: userId, verificationHash: hashUserId(userId)});
  }, [userId]);

  useEffect(() => {
    if (userId) {
      // for each page/view change, update or clear the WaveCX context
      const triggerPoint = triggerPointForView(view);
      if (triggerPoint) {
        setContext({triggerPoint});
      } else {
        clearContext();
      }
    }
  }, [view, userId]);

  return (
    <>
      <header>
        <h1>Targeted Content Example</h1>
        {userId !== '' && (
          <>
            <p>Signed in as: {userId}</p>
            <p>
              <button onClick={() => setUserId('')}>Sign Out</button>
            </p>
            <nav>
              <ul>
                {views.map((t) => (
                  <li key={t}>
                    <button onClick={() => setView(t)}>{t}</button>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
        {userId === '' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUserId(userIdInput);
              setUserIdInput('');
            }}
          >
            <label>
              Sign in as:<br/>
              <input type={'text'} value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)}/>
            </label>
            <br/>
            <br/>
            <button>Sign In</button>
          </form>
        )}
      </header>

      {userId !== '' && (
        <>
          <hr/>
          <main>
            <h2>{view}</h2>
            {view === 'account-view' && <p>This view has button-triggered content</p>}
            {view === 'payments' && <p>This view has popup content</p>}
            {view === 'no-trigger-point-page' && <p>This view has no content</p>}
          </main>
        </>
      )}
    </>
  );
};