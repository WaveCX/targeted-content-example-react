import {useEffect, useState} from 'react';

import {hashUserId} from './hash-user-id';
import {Modal} from './modal';

import styles from './main.module.css';

const apiBaseUrl = process.env['REACT_APP_API_BASE_URL'];
const orgCode = process.env['REACT_APP_ORG_CODE'];

const triggerPoints = [
  'account-view',
  'payments',
  'transfers',
];

export const Main = () => {
  const [userId, setUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [page, setPage] = useState(triggerPoints[0]);
  const [content, setContent] = useState<{triggerPoint: string; viewUrl: string}[]>([]);
  const [isReadingContent, setIsReadingContent] = useState(false);
  const [isContentHidden, setIsContentHidden] = useState(false);

  useEffect(() => {
    (async () => {
      setContent([]);
      if (userId !== '') {
        setIsReadingContent(true);
        setIsContentHidden(false);

        // fake delay for demonstration
        await new Promise((r) => setTimeout(r, 2000));

        const response = await fetch(`${apiBaseUrl}/${orgCode}/targeted-content-events`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            type: 'trigger-point',
            userId,
            userIdVerification: hashUserId(userId),
            triggerPoint: page,
            platform: 'desktop',
            contentTypes: ['featurette'], // only featurette content is relevant for feature tour
          }),
        });
        if (response.status === 201) {
          const responseBody = await response.json();
          setContent(responseBody.content);
          setIsReadingContent(false);
        }
      } else {
        setPage(triggerPoints[0]);
      }
    })();
  }, [page, userId]);

  return (
    <>
      {!isContentHidden && content.length > 0 && (
        <Modal onCloseRequested={() => setIsContentHidden(true)}>
          <iframe
            title={'Targeted Content'}
            src={content[0].viewUrl}
            className={styles.contentContainer}
          />
        </Modal>
      )}

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
                {triggerPoints.map((t) => (
                  <li key={t}>
                    <button onClick={() => setPage(t)}>{t}</button>
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
            <h2>{page}</h2>
            {isReadingContent && <p>Fetching content for trigger point "{page}"...</p>}
            {!isReadingContent && <pre>{JSON.stringify(content, null, 2)}</pre>}
          </main>
        </>
      )}
    </>
  );
};