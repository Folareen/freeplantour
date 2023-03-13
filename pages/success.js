import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useIntl } from 'react-intl';
import { AppLayout } from '../components/AppLayout';
import { getAppProps } from '../utils/getAppProps';

export default function Success() {
  const intl = useIntl();

  const getText = (id) => intl.formatMessage({ id });

  return (
    <div>
      <h1>{getText('success.message')}</h1>
    </div>
  );
}

Success.getLayout = function getLayout(page, pageProps) {
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
