import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import * as Yup from 'yup';
import DropdownSelect from "../components/form-controls/DropdownSelect";
import { SelectItem } from '../types/FormControls';

const items: SelectItem[] = [
    {
        id: '1',
        value: 'test1',
        label: 'Test1',
        featured: true
    },
    {
        id: '2',
        value: 'test2',
        label: 'Test2',
        featured: false
    },
    {
        id: '3',
        value: 'test3',
        label: 'Test3',
        featured: false
    }
]

describe('Test DropdownSelect Component', () => {
    beforeEach(() => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <DropdownSelect label="Test Field" placeholder="Test Placeholder" name="testField" allowInput={true} items={items} />
            </FormikWrap>
        );
    })

    test('Deault value should be an empty string when first get rendered', () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');
        expect(el.value).toBe('');
    })

    test('Value should be changed after user inputs', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');
        userEvent.type(el, 'John Doe');
        await waitFor(() => {
            expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        })
    })

    test('Should display dropdown and option list after clicking the input', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');
        userEvent.click(el);
        await waitFor(() => {
            expect(document.querySelector('.searchDropdown .options_list_wrap')).toBeInTheDocument();
            expect(document.querySelectorAll('.searchDropdown .options_list_wrap li').length).toBe(items.length);
        })
    })

    test('Should fill the input field after clicking the an option in the dropdown list', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');

        userEvent.click(el);
        await waitFor(async () => {
            expect(document.querySelector('.searchDropdown .options_list_wrap')).toBeInTheDocument();
        })

        const options = document.querySelectorAll('.searchDropdown .options_list_wrap li');
        userEvent.click(options[1]);
        await waitFor(() => {
            expect(screen.getByDisplayValue('Test2')).toBeInTheDocument();
        })          
    })

    test('Should filter and display the dropdown list based on input value', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');
        userEvent.type(el, 'Test3');
        await waitFor(() => {
            expect(screen.getByText('Test3')).toBeInTheDocument();
            expect(screen.queryByText('Test1')).not.toBeInTheDocument();
            expect(screen.queryByText('Test2')).not.toBeInTheDocument();
        })
    })

    test('Should keep the input value on blur if inputing a value and this value has a match in the dropdown list ', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');

        userEvent.type(el, 'Test3');
        expect(el.value).toBe('Test3');

        el.blur();
        await waitFor( () => {
            expect(document.querySelector('.searchDropdown .options_list_wrap')).not.toBeInTheDocument();
            expect(screen.getByDisplayValue('Test3')).toBeInTheDocument();
        })
    })    

    test('Should clear input field on blur if inputing a value but no match in the dropdown list ', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');

        userEvent.type(el, 'Test4');
        expect(el.value).toBe('Test4');

        el.blur();
        await waitFor(() => {
            expect(document.querySelector('.searchDropdown .options_list_wrap')).not.toBeInTheDocument();
            expect(el.value).toBe('');
        })
    })

    test('Can handle keyboard operations', async () => {
        const el = document.querySelector<HTMLInputElement>('.searchDropdown input');
        userEvent.click(el);

        await waitFor(() => {
            expect(document.querySelector('.searchDropdown .options_list_wrap')).toBeInTheDocument();    
        })

        const options = document.querySelectorAll('.searchDropdown .options_list_wrap li');

        userEvent.keyboard('[ArrowDown]');
        userEvent.keyboard('[ArrowUp]');
        userEvent.keyboard('[ArrowDown]');
        await waitFor(() => {
            expect(options[1]).toHaveClass('active');
        })
        userEvent.keyboard('[ArrowDown]');
        userEvent.keyboard('[ArrowDown]');
        userEvent.keyboard('[ArrowUp]');
        await waitFor(() => {
            expect(options[1]).toHaveClass('active');
        })

        userEvent.keyboard('[Enter]');
        await waitFor(() => {
            expect(el.value).toBe('Test2')
        })        
    })
})

describe('Test DropdownSelect Component with preset value', () => {
    test('Value should be equal to setValue after rendering if setValue is in the dropdown options', async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <DropdownSelect label="Test Field" placeholder="Test Placeholder" name="testField" allowInput={true} items={items} setValue="test3" />
            </FormikWrap>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Test3')).toBeInTheDocument();
        })        
    })

    test('Value should be empty string after rendering if setValue is not in the dropdown options', async () => {
        render(
            <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                <DropdownSelect label="Test Field" placeholder="Test Placeholder" name="testField" allowInput={true} items={items} setValue="test4" />
            </FormikWrap>
        );

        await waitFor(() => {
            expect(screen.queryByDisplayValue('Test3')).not.toBeInTheDocument();
        })        
    })    
})