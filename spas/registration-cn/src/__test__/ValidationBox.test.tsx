import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import * as Yup from 'yup';
import ValidationBox from "../components/form-controls/ValidationBox";

const mock = new MockAdapter(axios);
mock.onGet().reply(function(config) {
    if (config.url.includes('~get~sign~token~'))
        return [200, 1];
    if (config.url.includes('getAction=check_branched_email'))
        return [200, 'unused'];
    if (config.url.includes('getAction=create_email_verification_code'))
        return [200, {'result': 'success'}];
    if (config.url.includes('getAction=verify_email_verification_code') && config.url.includes('code=123456'))
        return [200, {'result': 'success'}];
    if (config.url.includes('getAction=verify_email_verification_code') && config.url.includes('code=000000'))
        return [200, {'result': 'error'}];        
});

const mockVerify = jest.fn();

describe('Test AutoAddress Component - email type', () => {
    beforeEach(async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().email().required()})} onSubmit={jest.fn()}>
                <ValidationBox name="testField" type="email" onVerify={mockVerify} />
            </FormikWrap>
        );
    })

    afterEach(() => {
        mockVerify.mockClear();
    })

    test('Should have empty value when first rendered', async () => {
        const inputEl = document.querySelector('.validation_box input[name="testField"]');
    expect(inputEl).toHaveValue('');
    })

    test('Should be allowed to get verification code only if input is valid', async () => {
        const inputEl = document.querySelector<HTMLInputElement>('.validation_box input[name="testField"]');
        const getCodeButton = document.querySelector('.validation_box .validation_wrap button');

        userEvent.click(getCodeButton);
        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).not.toBeInTheDocument();
        })

        userEvent.type(inputEl, 'test@abc');
        userEvent.click(getCodeButton);
        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).not.toBeInTheDocument();
        })

        userEvent.clear(inputEl);
        userEvent.type(inputEl, 'test@abc.com');
        userEvent.click(getCodeButton);
        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).toBeInTheDocument();
        })        
    })

    test('Should pass verification if inputting valid code', async () => {
        const inputEl = document.querySelector<HTMLInputElement>('.validation_box input[name="testField"]');
        const getCodeButton = document.querySelector('.validation_box .validation_wrap button');

        userEvent.type(inputEl, 'test@abc.com');
        userEvent.click(getCodeButton);
        await waitFor(() => {
            const codeInput = document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]');
            expect(codeInput).toBeInTheDocument();
            const verifyButton = document.querySelector('.validation_box .validation_wrap button');
            expect(verifyButton).toBeInTheDocument();
            userEvent.type(codeInput, '123456');
            userEvent.click(verifyButton);
        })

        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).not.toBeInTheDocument();
            expect(document.querySelector('.validation_box .validation_wrap button')).not.toBeInTheDocument();
            expect(mockVerify.mock.calls.length).toBe(1);
            expect(mockVerify.mock.calls[0][0]).toBe(true);
            expect(mockVerify.mock.calls[0][1]).toBe('email');
        })
    })

    test('Would fail if inputting invalid code', async () => {
        const inputEl = document.querySelector<HTMLInputElement>('.validation_box input[name="testField"]');
        const getCodeButton = document.querySelector('.validation_box .validation_wrap button');

        userEvent.type(inputEl, 'test@abc.com');
        userEvent.click(getCodeButton);
        await waitFor(() => {
            const codeInput = document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]');
            expect(codeInput).toBeInTheDocument();
            const verifyButton = document.querySelector('.validation_box .validation_wrap button');
            expect(verifyButton).toBeInTheDocument();
            userEvent.type(codeInput, '000000');
            userEvent.click(verifyButton);
        })

        await waitFor(() => {
            expect(inputEl).toHaveAttribute('disabled');
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).toBeInTheDocument();
            expect(document.querySelector('.validation_box .validation_wrap button')).toBeInTheDocument();
        })
    })

    test('Should reset verification status if change email', async () => {
        const inputEl = document.querySelector<HTMLInputElement>('.validation_box input[name="testField"]');
        const getCodeButton = document.querySelector('.validation_box .validation_wrap button');

        userEvent.type(inputEl, 'test@abc.com');
        userEvent.click(getCodeButton);
        await waitFor(() => {
            const codeInput = document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]');
            expect(codeInput).toBeInTheDocument();
            const verifyButton = document.querySelector('.validation_box .validation_wrap button');
            expect(verifyButton).toBeInTheDocument();
            userEvent.type(codeInput, '123456');
            userEvent.click(verifyButton);
        })

        await waitFor(() => {
            expect(inputEl).toHaveAttribute('disabled');
            const changeLink = document.querySelector<HTMLInputElement>('.validation_box .message-list a');
            userEvent.click(changeLink)
        })

        await waitFor(() => {
            expect(inputEl).not.toHaveAttribute('disabled');
            expect(document.querySelector('.validation_box .validation_wrap button')).toBeInTheDocument();
            expect(document.querySelector<HTMLInputElement>('.validation_box .validation_wrap input[name="testField_code"]')).not.toBeInTheDocument();
            expect(mockVerify.mock.calls.length).toBe(2);
            expect(mockVerify.mock.calls[1][0]).toBe(false);
            expect(mockVerify.mock.calls[1][1]).toBe('email');            
        })        
    })    
})
