import React from 'react';
import Modal from 'react-modal';
import { useActions } from "../../hooks/useActions";
import { ModalData } from '../../types/FormControls';
import Close from '../../assets/images/Close.svg';
import Close2 from '../../assets/images/Close2.svg';

const customStyles = {
  info: {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '800px',
      maxWidth: '90%',
      padding: '0',
      border: 'none',
      borderRadius: '0'
    },
    overlay: {
      backgroundColor: 'rgba(128, 128, 128, 0.25)',
      zIndex: '999'
    }
  },
  redirection: {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '800px',
      maxWidth: '90%',
      padding: '0',
      border: 'none',
      backgroundColor: '#2a2a2a',
      color: '#fff'
    },
    overlay: {
      backgroundColor: 'rgba(128, 128, 128, 0.25)',
      zIndex: '999'
    }
  }
};

Modal.setAppElement('#registration-app-cn');

interface CustomModalProps {
  data: ModalData
}

const CustomModal: React.FC<CustomModalProps> = ({data}) => {
  const { updateModalData } = useActions();

  const closeModal = () => {
    updateModalData(null);
  }

  if (!data) return null;

  return (
    <Modal 
    isOpen={data ? true : false}
    onRequestClose={closeModal}
    style={customStyles[data.type]}
    shouldCloseOnOverlayClick={false}
    >
      <div className={`modal-wrap ${data.type}-modal`}>
      { 
        !data.disableClose && <div className="close-modal"><img src={data.type === 'redirection' ? Close : Close2} alt="Close modal" onClick={closeModal} /></div>
      }
      <h5 className="modal-title">
        {data.title}
      </h5>
      <hr />
      <div className="modal-content" dangerouslySetInnerHTML={{__html: data.content}}></div>
      {
        data.buttonText && 
        <div className="modal-buttons">
          <button type="button" className="btn icm-btn-primary">
            {data.buttonLink ? 
            <a href={data.buttonLink} >{data.buttonText}</a>
            : data.buttonText}
          </button>
        </div>        
      }
      </div>
    </Modal>
  )
}

export default CustomModal