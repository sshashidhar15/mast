import React from "react";
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import userEvent from "@testing-library/user-event";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import FormikWrap from "../components/FormikWrap";
import { initialFormValues } from "../types/FormValues";
import * as Yup from 'yup';
import AutoAddress from "../components/form-controls/AutoAddress";

const suggestedAddresses = [
    {
        format: "https://api.experianaperture.io/address/format/v1/aWQ9MyBEb25nLCAzIEhhbyBNaW5mdSBMdSwgRWNoZW5nIFF1LCBFemhvdSBTaGksIEh1YmVpIFNoZW5nLCBaSE9ORyBHVU8gREEgTFV-YWx0X2tleT1-ZGF0YXNldD1DSE5fTkFWSU5GT35mb3JtYXRfa2V5PUNITiQkNDIwNzA0LjAuMTkwNTg5NTcwNi4wLjI1NDI3NTIxLjE0NTAxNjYzNTIkMyBIYW8kJH5RTD01",
        global_address_key: "aWQ9MyBEb25nLCAzIEhhbyBNaW5mdSBMdSwgRWNoZW5nIFF1LCBFemhvdSBTaGksIEh1YmVpIFNoZW5nLCBaSE9ORyBHVU8gREEgTFV-YWx0X2tleT1-ZGF0YXNldD1DSE5fTkFWSU5GT35mb3JtYXRfa2V5PUNITiQkNDIwNzA0LjAuMTkwNTg5NTcwNi4wLjI1NDI3NTIxLjE0NTAxNjYzNTIkMyBIYW8kJA",
        text: 
        "3 Dong, 3 Hao Minfu Lu, Echeng Qu, Ezhou Shi, Hubei Sheng"
    },
    {
        format: "https://api.experianaperture.io/address/format/v1/aWQ9MyBEb25nLCAzIEhhbyBOYW50YSBKaWUsIEVjaGVuZyBRdSwgRXpob3UgU2hpLCBIdWJlaSBTaGVuZywgWkhPTkcgR1VPIERBIExVfmFsdF9rZXk9fmRhdGFzZXQ9Q0hOX05BVklORk9-Zm9ybWF0X2tleT1DSE4kJDQyMDcwNC4wLjE5MDYxNTY1MjkuMC4yNTQ4ODc0MS4xNDUwMTY2MjM3JDMgSGFvJCR-UUw9NQ",
        global_address_key: "aWQ9MyBEb25nLCAzIEhhbyBOYW50YSBKaWUsIEVjaGVuZyBRdSwgRXpob3UgU2hpLCBIdWJlaSBTaGVuZywgWkhPTkcgR1VPIERBIExVfmFsdF9rZXk9fmRhdGFzZXQ9Q0hOX05BVklORk9-Zm9ybWF0X2tleT1DSE4kJDQyMDcwNC4wLjE5MDYxNTY1MjkuMC4yNTQ4ODc0MS4xNDUwMTY2MjM3JDMgSGFvJCQ",
        text: 
        "3 Dong, 3 Hao Nanta Jie, Echeng Qu, Ezhou Shi, Hubei Sheng"
    }
];
const formatedAddress = {
    address: "3 Dong 3 Hao Nanta Jie Echeng Qu",
    city: "Ezhou Shi",
    state: "Hubei Sheng",
    zipCode: "Not Available"
}

const mock = new MockAdapter(axios);
mock.onGet().reply(200, suggestedAddresses);
mock.onPost().reply(200, formatedAddress)

describe('Test AutoAddress Component', () => {
    beforeEach(async () => {
        await waitFor(() => {
            render(
                <FormikWrap initialValues={{...initialFormValues}} validationSchema={Yup.object().shape({testField: Yup.string().required()})} onSubmit={jest.fn()}>
                    <AutoAddress name="testField_" country="China" mode="auto" />
                </FormikWrap>
            );
        })
    })

    // afterEach(() => {
    //     mock.reset();
    // });

    test('Should show only auto field with no manual fields when rendered under auto mode', async () => {
        await waitFor(() => {
            expect(screen.getByAltText(/switch to manual/i)).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_auto_address"]')).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_address"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_city"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_state"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_zip_code"]')).not.toBeInTheDocument();
        })
    })

    test('Should switch between auto/manual mode when clicking the switch', async () => {
        const switchButton = document.querySelector('.auto-address .address-selector');
        userEvent.click(switchButton);

        await waitFor(() => {
            expect(screen.getByAltText(/switch to auto/i)).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_auto_address"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_address"]')).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_city"]')).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_state"]')).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_zip_code"]')).toBeInTheDocument();
        })

        userEvent.click(switchButton);
        await waitFor(() => {
            expect(screen.getByAltText(/switch to manual/i)).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_auto_address"]')).toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_address"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_city"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_state"]')).not.toBeInTheDocument();
            expect(document.querySelector('.auto-address input[name="testField_zip_code"]')).not.toBeInTheDocument();
        })        
    })    

    test('Should show address dropdown after inputting 3 or more letters and there are suggested addresses returned from API', async () => {
        const autoAddressInput = document.querySelector('.auto-address input[name="testField_auto_address"]');
        userEvent.type(autoAddressInput, '3 New');

        await waitFor(() => {
            expect(document.querySelector('.auto-address .address-list')).toBeInTheDocument();
            const lists = document.querySelectorAll('.auto-address .address-list li');
            expect(lists.length).toBe(2);
            expect(lists[1]).toHaveTextContent("3 Dong, 3 Hao Nanta Jie, Echeng Qu, Ezhou Shi, Hubei Sheng");
        })
    })

    test('Should fill in all fields after choosing an address from the dropdown list', async () => {
        const autoAddressInput = document.querySelector('.auto-address input[name="testField_auto_address"]');
        userEvent.type(autoAddressInput, '3 New');

        await waitFor(() => {
            expect(document.querySelector('.auto-address .address-list')).toBeInTheDocument();
            const lists = document.querySelectorAll('.auto-address .address-list li');
            userEvent.click(lists[1]);
        })

        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_address"]').value).toBe("3 Dong 3 Hao Nanta Jie Echeng Qu");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_city"]').value).toBe("Ezhou Shi");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_state"]').value).toBe("Hubei Sheng");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_zip_code"]').value).toBe("Not Available");            
        })
    })

    test('Should clear field(s) when switching between auto/manual mode', async () => {
        const switchButton = document.querySelector('.auto-address .address-selector');
        const autoAddressInput = document.querySelector('.auto-address input[name="testField_auto_address"]');
        userEvent.type(autoAddressInput, '3 New');

        await waitFor(() => {
            expect(document.querySelector('.auto-address .address-list')).toBeInTheDocument();
            const lists = document.querySelectorAll('.auto-address .address-list li');
            userEvent.click(lists[1]);
        })

        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_address"]').value).toBe("3 Dong 3 Hao Nanta Jie Echeng Qu");

            userEvent.click(switchButton);
        })

        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_auto_address"]').value).toBe('');
            userEvent.click(switchButton);
        })

        await waitFor(() => {
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_address"]').value).toBe("");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_city"]').value).toBe("");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_state"]').value).toBe("");
            expect(document.querySelector<HTMLInputElement>('.auto-address input[name="testField_zip_code"]').value).toBe("");   
        })
    })
})