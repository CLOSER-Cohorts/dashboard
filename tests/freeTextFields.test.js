import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/router';

import GenericDashboard from '../components/GenericDashboard';
import { getFieldValueCounts, panelContentsDashbord } from '../lib/frontendUtility';

const colecticaQueryResults = {
  'Lifestage': [{
    agency: 'uk.lha',
    userAttributeValue: 'Third age',
    studyUnitIdentifier: '11fc8ab8-e8ff-4364-bf18-0a99e36b048b'
  },
  {
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Adolescence',
    studyUnitIdentifier: '487eae00-70da-46fc-a2e4-c8eb081c5b8f'
  }],
  'LifestageDescription': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: '19 - 30 years',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'Creator': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Professor Alex Bloggs',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'Publisher': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Centre for Longitudinal Studies, Institute of Education',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'AnalysisUnit': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Individual',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'KindOfData': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Demographic Data',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'Country': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'United Kingdom',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'ModeOfCollection': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'Assessment of knowledge, skills, aptitude, or educational achievement by means of specialised measures or tests.',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }],
  'TypeOfModeOfCollection': [{
    agency: 'uk.cls.nextsteps',
    userAttributeValue: 'SelfAdministeredQuestionnaire.Paper',
    studyUnitIdentifier: '92f50262-1a83-4ad0-bfb4-6129a0a8d7ad'
  }]
}

const tabNames = ["Lifestage",
  "Lifestage Description",
  "Creator",
  "Publisher",
  "Analysis Unit",
  "Kind Of Data",
  "Country",
  "Mode Of Collection",
  "Type Of Mode Of Collection"
];

const userAttributeTitles = tabNames.map(tabName => tabName.replaceAll(" ", ""))

const unorderedFieldValueCounts = getFieldValueCounts(colecticaQueryResults)

const fieldValueCounts = {}

userAttributeTitles.forEach(fieldTitle => {
  fieldValueCounts[fieldTitle] = unorderedFieldValueCounts[fieldTitle]
});

const mockRouterEvents = {
  on: jest.fn(),
  off: jest.fn(),
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('loads and displays panel for free text fields', () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
          events: mockRouterEvents,
        });

    ({ getByText } = render(<GenericDashboard value={0}
      data={colecticaQueryResults}
      tabNames={tabNames}
      panelContents={panelContentsDashbord}
      itemCounts={fieldValueCounts}
    />))
  })

  test('loads and displays panel for \'Lifestage Description\' free text fields', async () => {
    await userEvent.click(screen.getByText('Lifestage Description'))
    expect(getByText('19 - 30 years')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Lifestage\' free text fields', async () => {
    // We clicked on 'Lifestage Description' first because the 'Lifestage' tab is displayed by
    // default when the dashboard is loaded, and we want to check if the link to the 'Lifestage'
    // link is working. There will also be an error if we don't go to the 'Lifestage Description'
    // tab first because the text 'Lifestage' will be on the screen twice, and Jest will throw
    // an error saying "Found multiple elements with the text: Lifestage"  
    await userEvent.click(screen.getByText('Lifestage Description'))
    await userEvent.click(screen.getByText('Lifestage'))
    expect(getByText('Third age')).toBeInTheDocument()
    expect(getByText('Adolescence')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Creator\' free text fields', async () => {
    await userEvent.click(screen.getByText('Creator'))
    expect(getByText('Professor Alex Bloggs')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Publisher\' free text fields', async () => {
    await userEvent.click(screen.getByText('Publisher'))
    expect(getByText('Centre for Longitudinal Studies, Institute of Education')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Analysis Unit\' free text fields', async () => {
    await userEvent.click(screen.getByText('Analysis Unit'))
    expect(getByText('Individual')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Kind Of Data\' free text fields', async () => {
    await userEvent.click(screen.getByText('Kind Of Data'))
    expect(getByText('Demographic Data')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Country\' free text fields', async () => {
    await userEvent.click(screen.getByText('Country'))
    expect(getByText('United Kingdom')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Mode Of Collection\' free text fields', async () => {
    await userEvent.click(screen.getByText('Mode Of Collection'))
    expect(getByText('Assessment of knowledge, skills, aptitude, or educational achievement by means of specialised measures or tests.')).toBeInTheDocument()
  })

  test('loads and displays panel for \'Type Of Mode Of Collection\' free text fields', async () => {
    await userEvent.click(screen.getByText('Type Of Mode Of Collection'))
    expect(getByText('SelfAdministeredQuestionnaire.Paper')).toBeInTheDocument()

  })
})