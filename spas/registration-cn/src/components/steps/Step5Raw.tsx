import React, {useMemo} from 'react';
import { useTranslation } from 'react-i18next';
import QuestionAnswer from '../form-controls/QuestionAnswer';
import Checkbox from '../form-controls/Checkbox';
import { SecurityQuestions } from '../../types/FormControls';

interface Step5RawProps {
  stepType: 'individual' | 'joint'
}

const Step5Raw: React.FC<Step5RawProps> = ({stepType}) => {
  const { t } = useTranslation();
  const prefix = stepType === 'joint' ? 'joint_' : '';
  const questions = useMemo(() => (
    SecurityQuestions.map(q => (
      {
        ...q,
        label: t(`security_question_${q.id}`)
      }
    ))
  ), [QuestionAnswer])

  return (
    <>
      <div className="section_title">
        <h3>{t("security_question_title")}</h3>
      </div>        
      <div className="input_group">
        <QuestionAnswer name={`${prefix}security`} desc={t("security_question_desc")} questionPlaceholder={t("security_question_placeholder")} answerLabel={t("security_answer_label")} questions={questions} />
      </div>      
      <div className="section_title">
        <h3>{t("declaration_title")}</h3>
      </div>
      <div className='declaration-wrap' dangerouslySetInnerHTML={{__html: t(`declaration_branch_${window['currentBranchID']}`)}}></div>
      <div className="input_group">
        <Checkbox name={`${prefix}i_agree_with_all_of_above`} label={t("i_agree_with_all_of_above_label")} />
      </div>
      <div className='help-wrap' dangerouslySetInnerHTML={{__html: t(`declaration_help_branch_${window['currentBranchID']}`)}}></div>
    </>
  )
}

export default Step5Raw