import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useIntl } from 'react-intl';
import { AppLayout } from '../components/AppLayout';
import { db } from '../firebase.config';
import { getAppProps } from '../utils/getAppProps';

export default function TokenTopup() {
  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  const handleClick = async () => {
    console.log('add new token!')
    const result = await fetch(`/api/addTokens`, {
      method: 'POST',
    });
    const json = await result.json();
    window.location.href = json.session.url;
  };

  return (
    <div>
      <h1></h1>
      <button className="btn" onClick={handleClick}>
        {getText('topup.btn')}
      </button>
    </div>
  );
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const props = await getAppProps(ctx);
    return {
      props,
    };
  },
});
