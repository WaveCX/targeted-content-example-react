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

type ContentItem = {
  triggerPoint: string;
  viewUrl: string;
  presentationType: 'popup' | 'button-triggered';
  buttonConfig?: {
    title: string;
    textColor: string;
    backgroundColor: string;
    borderRadius: number;
  };
};

export const Main = () => {
  const [userId, setUserId] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [page, setPage] = useState(triggerPoints[0]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isReadingContent, setIsReadingContent] = useState(false);
  const [isPopupContentShown, setIsPopupContentShown] = useState(true);
  const [isButtonTriggeredContentShown, setIsButtonTriggeredContentShown] = useState(false);

  const popupContent = content.filter((c) => c.presentationType === 'popup');
  const buttonTriggeredContent = content.filter((c) => c.presentationType === 'button-triggered');

  useEffect(() => {
    (async () => {
      setContent([]);
      if (userId !== '') {
        setIsReadingContent(true);
        setIsPopupContentShown(true);
        setIsButtonTriggeredContentShown(false)

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
      {isPopupContentShown && popupContent.length > 0 && (
        <Modal onCloseRequested={() => setIsPopupContentShown(false)}>
          <iframe
            title={'Targeted Content'}
            src={popupContent[0].viewUrl}
            className={styles.contentContainer}
          />
        </Modal>
      )}

      {isButtonTriggeredContentShown && buttonTriggeredContent.length > 0 && (
        <Modal onCloseRequested={() => setIsButtonTriggeredContentShown(false)}>
          <iframe
            title={'Targeted Content'}
            src={buttonTriggeredContent[0].viewUrl}
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
            {buttonTriggeredContent.length > 0 && (
              <p>
                <button
                  className={styles.triggerButton}
                  style={{
                    borderRadius: buttonTriggeredContent[0].buttonConfig?.borderRadius,
                    backgroundColor: buttonTriggeredContent[0].buttonConfig?.backgroundColor,
                    color: buttonTriggeredContent[0].buttonConfig?.textColor,
                  }}
                  onClick={() => setIsButtonTriggeredContentShown(true)}
                >
                  {buttonTriggeredContent[0].buttonConfig?.title}
                </button>
              </p>
            )}
          </main>
        </>
      )}
    </>
  );
};