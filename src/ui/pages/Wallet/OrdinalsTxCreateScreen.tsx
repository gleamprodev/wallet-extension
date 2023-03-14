import { Button, Input, Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { Inscription } from '@/shared/types';
import CHeader from '@/ui/components/CHeader';
import InscriptionPreview from '@/ui/components/InscriptionPreview';
import { useCreateOrdinalsTxCallback, useFetchUtxosCallback, useOrdinalsTx } from '@/ui/state/transactions/hooks';
import { isValidAddress } from '@/ui/utils';

import { useNavigate } from '../MainRoute';

import wallet from '@/background/controller/wallet';
import { DomainInfo } from '@/background/service/domainService';
import { DOMAIN_LEVEL_ONE } from '@/shared/constant';

import '@/ui/styles/domain.less';

export default function OrdinalsTxCreateScreen() {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState(true);
  const navigate = useNavigate();

  const { state } = useLocation();
  const { inscription } = state as {
    inscription: Inscription;
  };
  const ordinalsTx = useOrdinalsTx();
  const [inputAddress, setInputAddress] = useState(ordinalsTx.toAddress);
  const [error, setError] = useState('');
  const createOrdinalsTx = useCreateOrdinalsTxCallback();

  const fetchUtxos = useFetchUtxosCallback();

  const [parseAddress, setParseAddress] = useState('');
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    fetchUtxos();
  }, []);

  useEffect(() => {
    setDisabled(true);
    setError('');
    let toAddress = '';
    if (inputAddress.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
      toAddress = parseAddress;
    } else {
      toAddress = inputAddress
    }

    if (!isValidAddress(toAddress)) {
      return;
    }

    if (toAddress == ordinalsTx.toAddress) {
      //Prevent repeated triggering caused by setAmount
      setDisabled(false);
      return;
    }

    createOrdinalsTx(toAddress, inscription)
      .then(() => {
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
        setError(e.message);
      });
  }, [inputAddress]);

  return (
    <Layout className="h-full">
      <Header className=" border-white border-opacity-10">
        <CHeader
          onBack={() => {
            window.history.go(-1);
          }}
        />
      </Header>
      <Content style={{ backgroundColor: '#1C1919' }}>
        <div className="flex flex-col items-strech mx-5 mt-5 gap-3_75 justify-evenly">
          <div className="flex self-center px-2 text-2xl font-semibold h-13">{t('Send')} Inscription</div>

          <div className="flex justify-between w-full mt-5 text-soft-white">
            <span className="flex items-center justify-center ">{t('Inscription')}</span>
            {inscription && <InscriptionPreview data={inscription} size="small" />}
          </div>

          <Input
            className="!mt-5 font-semibold text-white h-15_5 box default hover"
            placeholder={t('Recipients BTC address')}
            defaultValue={inputAddress}
            onChange={async (e) => {
              const val = e.target.value;
              setInputAddress(val);

              if (val.toLowerCase().endsWith(DOMAIN_LEVEL_ONE)) {
                wallet.queryDomainInfo(val).then((ret: DomainInfo) => {
                  setParseAddress(ret.owner_address)
                }).catch((err) => {
                  setParseError(val);
                })
              }
            }}
            autoFocus={true}
          />

          <div className="word-breakall">{parseAddress}</div>

          <div className="word-breakall">{parseAddress}</div>
          {parseError ? (
            <span className="text-lg text-warn h-5">{`${parseError}` + ' is not occupied, click '}<a href="https://btcdomains.io" target={'_blank'} rel="noreferrer">btcdomains</a> to register.</span>
          ) : null}

          <span className="text-lg text-error h-5">{error}</span>
          <Button
            disabled={disabled}
            size="large"
            type="primary"
            className="box"
            onClick={(e) => {
              navigate('OrdinalsTxConfirmScreen');
            }}>
            <div className="flex items-center justify-center text-lg font-semibold">{t('Next')}</div>
          </Button>
        </div>
      </Content>
    </Layout>
  );
}
