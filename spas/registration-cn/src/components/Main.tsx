import React, {useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import { useActions } from "../hooks/useActions";
import MobileNav from './MobileNav';
import Nav from './Nav';
import FormContainer from './FormContainer';
import { useTypedSelector } from '../hooks/useTypedSelector';
import Overlay from './parts/Overlay';
import CustomModal from './parts/CustomModal';

const Main = () => {
  const { modalData, showRegOverlay } = useTypedSelector(state => state.app);
  const { t } = useTranslation();
  const { getFeedData } = useActions();

  useEffect(() => {
    getFeedData();
  }, [])

  return (
    <div className='page-section landing-page register-content-wrapper'>
      <h1 className="header-title">{window['regType'] === 'live' ? t("form_title_live") : t("form_title_demo")}</h1>
      <div className={`icm-open-account ${window['regType']}`}>
        <MobileNav />
        <div className="main_register_wrap">
          <div className="register_wrap">
            <Nav />
            <FormContainer />
          </div>
        </div>
      </div>
      <CustomModal data={modalData} />
      { showRegOverlay && <Overlay />}
    </div>
  )
}

export default Main