import { env } from 'node:process';

// @ts-expect-error -- experimental-strip-types flag is used to allow import of .ts files without compilation
import { auth } from '../inits/firebase.ts';
// @ts-expect-error -- experimental-strip-types flag is used to allow import of .ts files without compilation
import { digProperty } from '../utils/object.ts';

// the function help to get the idToken of the user to make the request to the firebase functions
// 1. set uid below
// 2. run "npm run get-id-token" from functions/ folder
// 3. the function will print the id token to the console
// 4. set it as Bearer token in Authorization header (e.g. in postman)
//
// IMPORTANT: Ensure GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_API_KEY are from the SAME Firebase project
// Otherwise you'll get CREDENTIAL_MISMATCH error
//
const getIdToken = async (uid_or_email: string) => {
  const apiKey = env.WEB_API_KEY;

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;

  let uid = uid_or_email;

  // Currently emails are not supported, GAC does not have permission to get user by email
  if (uid_or_email.includes('@')) {
    const authRecord = await auth.getUserByEmail(uid_or_email);

    uid = authRecord.uid;
  }

  const customToken = await auth.createCustomToken(uid);

  const req = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true,
    }),
  };

  // using global fetch for the first time :)
  const res = await fetch(url, req);

  const data = await res.json();

  const idToken = digProperty(data, 'idToken');

  if (typeof idToken !== 'string') {
    console.dir(data, { depth: null });
  } else {
    console.log(`\n${idToken}\n`);
  }
};

const uid_or_email = 'did5mbBiMrHNI1QixGRknqBBzPdM';

getIdToken(uid_or_email).catch(console.error);
