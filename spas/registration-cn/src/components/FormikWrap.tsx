import React from 'react';
import { Formik, Form } from 'formik';
import { FormValues } from '../types/FormValues';

interface FormikWrapProps {
    initialValues: FormValues,
    validationSchema: any,
    onSubmit: (values: FormValues) => void,
    children: React.ReactNode
}

const FormikWrap: React.FC<FormikWrapProps> = ({initialValues, validationSchema, onSubmit, children}) => {
  return (
    <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
    >
        {
        formik => (
            <Form>
                {children}
            </Form>
        )
        }
    </Formik>
  )
}

export default FormikWrap