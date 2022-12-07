import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import * as Yup from 'yup';
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import DateSelect from "../components/form-controls/DateSelect";

describe('Test DateSelect Component', () => {
    beforeEach(() => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <DateSelect name="testField" label="Test Field" />
            </FormikWrap>
        );
    })

    test('Day, month and year field should all be empty string when first rendered', async () => {
        const dayEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_day"]');
        const monthEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_month"]');
        const yearEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_day"]');

        await waitFor(() => {
            expect(dayEl).toHaveValue('');
            expect(monthEl).toHaveValue('');
            expect(yearEl).toHaveValue('');
        })
    })

    test('Input day, month and year and all field values will be updated accordingly', async () => {
        const dayEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_day"]');
        const monthEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_month"]');
        const yearEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_year"]');

        userEvent.type(dayEl, '21');
        await waitFor(() => {
            expect(dayEl).toHaveValue('21');
        })

        userEvent.click(monthEl);
        await waitFor(async () => {
            expect(document.querySelector('.date_select .searchDropdown .options_list_wrap')).toBeInTheDocument();        
        })

        const options = document.querySelectorAll('.date_select .searchDropdown .options_list_wrap li');
        userEvent.click(options[1]);
        
        await waitFor(async () => {
            expect(monthEl).toHaveValue('February');
        })

        userEvent.type(yearEl, '1999');
        await waitFor(() => {
            expect(yearEl).toHaveValue('1999');
        })
    })

    test('Can handle leap year', async () => {
        const dayEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_day"]');
        const monthEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_month"]');
        const yearEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_year"]');

        userEvent.type(dayEl, '30');
        await waitFor(() => {
            expect(dayEl).toHaveValue('30');
        })

        userEvent.click(monthEl);
        await waitFor(async () => {
            expect(document.querySelector('.date_select .searchDropdown .options_list_wrap')).toBeInTheDocument();        
        })

        const options = document.querySelectorAll('.date_select .searchDropdown .options_list_wrap li');
        userEvent.click(options[1]);
        
        await waitFor(async () => {
            expect(monthEl).toHaveValue('February');
        })

        userEvent.type(yearEl, '1999');
        await waitFor(() => {
            expect(yearEl).toHaveValue('1999');
        })

        yearEl.blur();
        await waitFor(() => {
            expect(dayEl.value).toBe('2');
            expect(monthEl.value).toBe('March');
        })
    })

    test('Can handle solar/luna month', async () => {
        const dayEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_day"]');
        const monthEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_month"]');
        const yearEl = document.querySelector<HTMLInputElement>('.date_select input[name="testField_year"]');

        userEvent.type(dayEl, '31');
        await waitFor(() => {
            expect(dayEl).toHaveValue('31');
        })

        userEvent.click(monthEl);
        await waitFor(async () => {
            expect(document.querySelector('.date_select .searchDropdown .options_list_wrap')).toBeInTheDocument();        
        })

        const options = document.querySelectorAll('.date_select .searchDropdown .options_list_wrap li');
        userEvent.click(options[3]);
        
        await waitFor(async () => {
            expect(monthEl).toHaveValue('April');
        })

        userEvent.type(yearEl, '1999');
        await waitFor(() => {
            expect(yearEl).toHaveValue('1999');
        })

        yearEl.blur();
        await waitFor(() => {
            expect(dayEl.value).toBe('1');
            expect(monthEl.value).toBe('May');
        })
    })    
})