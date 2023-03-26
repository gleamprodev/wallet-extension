import { Button, Input } from 'antd';
import { Layout } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { WalletKeyring } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import { useAppDispatch } from '@/ui/state/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useWallet } from '@/ui/utils';

export default function EditWalletNameScreen() {
  const { t } = useTranslation();

  const { state } = useLocation();
  const { keyring } = state as {
    keyring: WalletKeyring;
  };

  const wallet = useWallet();
  const [alianName, setAlianName] = useState('');
  const dispatch = useAppDispatch();
  const handleOnClick = async () => {
    const newKeyring = await wallet.setKeyringAlianName(keyring, alianName || keyring.alianName);
    dispatch(keyringsActions.updateKeyringName(newKeyring));
    window.history.go(-1);
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      handleOnClick();
    }
  };

  return (
    <Layout className="h-full">
      <CHeader
        onBack={() => {
          window.history.go(-1);
        }}
        title={keyring.alianName}
      />
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <Input
            className="font-semibold text-white mt-1_25 h-15_5 box default focus:active"
            placeholder={keyring.alianName}
            onChange={(e) => {
              setAlianName(e.target.value);
            }}
            onKeyUp={(e) => handleOnKeyUp(e)}
            autoFocus={true}
          />
          <Button
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              handleOnClick();
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Change Wallet Name')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
