import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import React from "react";
import { useRouter } from 'next/router';

import GenericDashboard from '../components/GenericDashboard';
import { getItemCountsMissingRelationships, panelContentsMissingRelationships } from '../lib/frontendUtility.js';

const urnForOrphanDatasets = ["urn:ddi:uk.alspac:83542309-c728-4a1a-b4f0-b6fe302770c5:3"]
const urnForDatasetsMissingFiles = ["urn:ddi:uk.wchads:f10d92d8-896b-45c6-92cf-a8374d1f4a40:5"]
const urnForOrphanVariables = ["urn:ddi:uk.mrcleu-uos.sws:dbb1a3a3-1c95-4d88-9913-3764ec8ebb63:1"]
const urnForOrphanQuestionnaires = ["urn:ddi:uk.cls.nextsteps:83ab13bb-90e6-40fe-8741-16cf36400450:3"]
const urnForQuestionnairesMissingPDFs = ["urn:ddi:uk.iser.ukhls:c8fe4053-b5da-4960-afdf-f0ef2907b12e:1"]
const urnForOrphanQuestions = ["urn:ddi:uk.alspac:76aabc0c-7112-405b-9061-3abc7005fa3f:1"]
const urnForInvalidAgencies = ["urn:ddi:uk.alspacc:76aabc0c-7112-405b-9061-3abc7005fa3f:1"]
const urnForDataCollectionsWithoutOrganisation = ["urn:ddi:uk.cls.mcs:dbb1a3a3-1c95-4d88-9913-3764ec8ebb63:1"]

const tabNames = ["Orphan datasets",
    "Datasets missing files",
    "Orphan variables",
    "Orphan questionnaires",
    "Questionnaires missing PDFs",
    "Orphan questions",
    "Invalid agencies",
    "Data collection without organisation"]

var dashboardData = {
    "orphanPhysicalInstances": urnForOrphanDatasets,
    "physicalInstancesWithNoFileUri": urnForDatasetsMissingFiles,
    "orphanVariables": urnForOrphanVariables,
    "orphanQuestionnaires": urnForOrphanQuestionnaires,
    "questionnairesWithoutExternalInstruments": urnForQuestionnairesMissingPDFs,
    "orphanQuestions": urnForOrphanQuestions,
    "invalidAgencies": urnForInvalidAgencies,
    "dataCollectionsWithoutOrganisation": urnForDataCollectionsWithoutOrganisation
}

const itemCountsPerAgency = getItemCountsMissingRelationships(dashboardData)

const mockRouterEvents = {
    on: jest.fn(),
    off: jest.fn(),
  };

  jest.mock('next/router', () => ({
    useRouter: jest.fn(),
  }));

window.scrollTo = jest.fn()

describe('loads and displays panels for missing/incorrect relationships', () => {
    beforeEach(() => {
        useRouter.mockReturnValue({
              events: mockRouterEvents,
            });

        ({ getByText } = render(<GenericDashboard
            data={dashboardData}
            colecticaRepositoryHostname="discovery.closer.ac.uk"
            tabNames={tabNames}
            panelContents={panelContentsMissingRelationships}
            itemCounts={itemCountsPerAgency}
        />))
    });

    test('loads and displays panel for orphan datasets', async () => {
        await userEvent.click(screen.getByText('Orphan datasets'))
        expect(getByText('uk.alspac')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.alspac'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.alspac/83542309-c728-4a1a-b4f0-b6fe302770c5')).toBeInTheDocument()
    })

    test('loads and displays panel for datasets missing files', async () => {
        await userEvent.click(screen.getByText('Datasets missing files'))
        expect(getByText('uk.wchads')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.wchads'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.wchads/f10d92d8-896b-45c6-92cf-a8374d1f4a40')).toBeInTheDocument()
    })

    test('loads and displays panel for orphan variables', async () => {
        await userEvent.click(screen.getByText('Orphan variables'))
        expect(getByText('uk.mrcleu-uos.sws')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.mrcleu-uos.sws'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.mrcleu-uos.sws/dbb1a3a3-1c95-4d88-9913-3764ec8ebb63')).toBeInTheDocument()
    })

    test('loads and displays panel for orphan questionnaires', async () => {
        await userEvent.click(screen.getByText('Orphan questionnaires'))
        expect(getByText('uk.cls.nextsteps')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.cls.nextsteps'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.cls.nextsteps/83ab13bb-90e6-40fe-8741-16cf36400450')).toBeInTheDocument()
    })

    test('loads and displays panel for questionnaires missing PDFs', async () => {
        await userEvent.click(screen.getByText('Questionnaires missing PDFs'))
        expect(getByText('uk.iser.ukhls')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.iser.ukhls'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.iser.ukhls/c8fe4053-b5da-4960-afdf-f0ef2907b12e')).toBeInTheDocument()
    })

    test('loads and displays panel for orphan questions', async () => {
        await userEvent.click(screen.getByText('Orphan questions'))
        expect(getByText('uk.alspac')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.alspac'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.alspac/76aabc0c-7112-405b-9061-3abc7005fa3f')).toBeInTheDocument()
    })

    test('loads and displays panel for invalid agencies', async () => {
        await userEvent.click(screen.getByText('Invalid agencies'))
        expect(getByText('uk.alspacc')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.alspacc'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.alspacc/76aabc0c-7112-405b-9061-3abc7005fa3f')).toBeInTheDocument()
    })

    test('loads and displays panel for data collection without organisation', async () => {
        await userEvent.click(screen.getByText('Data collection without organisation'))
        expect(getByText('uk.cls.mcs')).toBeInTheDocument()
        await userEvent.click(screen.getByText('uk.cls.mcs'))
        expect(getByText('https://discovery.closer.ac.uk/item/uk.cls.mcs/dbb1a3a3-1c95-4d88-9913-3764ec8ebb63')).toBeInTheDocument()
    })
})
