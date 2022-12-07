import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import * as Yup from 'yup';
import Input from "../components/form-controls/Input";

describe('Test Input Component', () => {
    beforeEach(() => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <Input name="testField" label="Test Field" type="text" />
            </FormikWrap>
        );    
    })

    test('Deault value should be an empty string when first get rendered', () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;
        expect(inputEl.value).toBe('');
    })

    test('Value should be changed after user inputs', async () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;
        userEvent.type(inputEl, 'John Doe');
        await waitFor(() => {
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        })
    })

    test('Should have is-focused class when the input is on focus', async () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;

        userEvent.click(inputEl);
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.is-focused')).toBeInTheDocument();
        })

        inputEl.blur();
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.is-focused')).not.toBeInTheDocument();
        })
    })

    test('Should have has-value class when the input is not empty', async () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;

        userEvent.type(inputEl, 'John Doe');
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.has-value')).toBeInTheDocument();
        })

        userEvent.clear(inputEl);
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.has-value')).not.toBeInTheDocument();
        })
    })

    test('Should have no validation class when first rendered', () => {
        const inputWrap = document.querySelector('.el_wrap');
        expect(inputWrap).not.toHaveClass('error');
        expect(inputWrap).not.toHaveClass('success');
    })

    test('Should show success validation class when field validation is passed', async () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;

        userEvent.type(inputEl, 'John Doe');
        inputEl.blur();
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.success')).toBeInTheDocument();
            expect(document.querySelector('.el_wrap.error')).not.toBeInTheDocument();
        })
    })

    test('Should show error validation class when field validation is failed', async () => {
        const inputEl = screen.getByRole('textbox', {name: /test field/i}) as HTMLInputElement;

        inputEl.focus();
        inputEl.blur();
        await waitFor(() => {
            expect(document.querySelector('.el_wrap.error')).toBeInTheDocument();
            expect(document.querySelector('.el_wrap.success')).not.toBeInTheDocument();
        })
    })
})

describe('Test Input component with preset value', () => {
    test('Value should be equal to setValue after rendering', async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <Input name="testField" label="Test Field" type="text" setValue="Hello" />
            </FormikWrap>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
        })
    })

    test('Value should be equal to prefix after rendering', async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <Input name="testField" label="Test Field" type="text" prefix="+61" />
            </FormikWrap>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('+61')).toBeInTheDocument();
        })
    })

    test('Value should be equal to setValue after rendering with both setValue and prefix set', async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <Input name="testField" label="Test Field" type="text" setValue={'Hello'} prefix="+61" />
            </FormikWrap>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
        })
    })    
})