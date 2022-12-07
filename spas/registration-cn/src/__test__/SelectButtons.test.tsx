import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import * as Yup from 'yup';
import SelectButtons from "../components/form-controls/SelectButtons";
import { RegTypes } from '../types/FormControls';

describe('Test SelectButtons Component', () => {
    beforeEach(() => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <SelectButtons name="testField" label="Test Field" size="small" type="normal" options={RegTypes}/>
            </FormikWrap>
        );
    })

    test('Value should be an empty string when first rendered', () => {
        const inputEl = document.querySelector('.select_btns input');
        expect(inputEl).toHaveValue('');
    })

    test('Value should be updated accordingly when a button is selected', async () => {
        const buttons = document.querySelectorAll('.select_btns .select_btn');
        userEvent.click(buttons[1]);
        await waitFor(() => {
            const inputEl = document.querySelector('.select_btns input');
            expect(inputEl).toHaveValue('joint');
            expect(buttons[1]).toHaveClass('selected');
        })
    })
})