import React from 'react';
import DropdownSelect from './DropdownSelect';
import Input from './Input';
import { SelectItem } from '../../types/FormControls';

interface QuestionAnswerProps {
    name: string;
    desc: string;
    questionPlaceholder: string;
    answerLabel: string;
    questions: SelectItem[],
}

const SecretAnswer: React.FC<QuestionAnswerProps> = (props) => {
    const { name, desc, questionPlaceholder, answerLabel, questions } = props;

    return (
        <div className='question_answer'>
            <span className='desc'>{desc}</span>
            <DropdownSelect placeholder={questionPlaceholder} name={`${name}_question`} allowInput={false} items={questions} maxHeight={400} />
            <Input type="text" label={answerLabel} name={`${name}_answer`} />
        </div>
    )
}

export default SecretAnswer