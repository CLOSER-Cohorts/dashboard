import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import React from "react";

import GenericDashboard from '../components/GenericDashboard';
import { getItemCountsTopicIssues, panelContentsTopicIssues } from '../lib/frontendUtility'

var topicMismatchesJSON = [{ "questionName": "qi_S3_COVID_Died", "questionSummary": "Do you know anyone who has died from COVID-19?", "questionUrn": "urn:ddi:uk.genscot:210feb5f-b67c-49a8-b923-b990471165fb:1", "questionGroupName": "11612", "questionGroupLabel": "Life events (CV19)", "questionGroupUrn": "urn:ddi:uk.closer:f37a0b1e-5570-4e3c-999e-b1f40f36d9ad:1", "relatedVariableName": "CL3071", "relatedVariableLabel": "Prefer not to answer", "relatedVariableUrn": "urn:ddi:uk.genscot:61e4db15-74ac-4897-a280-5b2dd83c392a:1", "relatedVariableGroupName": "11609", "relatedVariableGroupLabel": "Employment and income (CV19)", "relatedVariableGroupUrn": "urn:ddi:uk.closer:eb41d309-f7e1-4147-a88c-d38ff9cc3029:1" },
{ "questionName": "qi_A9", "questionSummary": "Do you think that you have, or have had, COVID-19?", "questionUrn": "urn:ddi:uk.alspac:a13f55c4-880c-4f2c-a364-d69bb4118945:2", "questionGroupName": "11610", "questionGroupLabel": "Expectation, attitudes and beliefs (CV19)", "questionGroupUrn": "urn:ddi:uk.closer:41662dd4-6f10-4f6a-b544-e4236e880b9c:3", "relatedVariableName": "covid1_2580", "relatedVariableLabel": "a9: Participant thinks they have or have had COVID-19: COVID1", "relatedVariableUrn": "urn:ddi:uk.alspac:c0e5d5a6-dfa5-4aa9-bc63-c0dc0bc78d3b:5", "relatedVariableGroupName": "11603", "relatedVariableGroupLabel": "Physical health (CV19)", "relatedVariableGroupUrn": "urn:ddi:uk.closer:629343d6-9a73-4066-8b5f-0c6af2602f64:5" },
{ "questionName": "qi_ConDNA", "questionSummary": "ASK RESPONDENT: May we have your consent to take a sample of your DNA from your blood, to be stored and used in scientific research?", "questionUrn": "urn:ddi:uk.iser.ukhls:878279fc-d12c-4a5a-8501-1b800796a387:1", "questionGroupName": "10301", "questionGroupLabel": "Cardiovascular system", "questionGroupUrn": "urn:ddi:uk.closer:40dc03fa-d3a1-4b5d-b115-e9f0af68755f:1", "relatedVariableName": "b_condna", "relatedVariableLabel": "consent to take a sample of your DNA", "relatedVariableUrn": "urn:ddi:uk.iser.ukhls:243cc972-d480-4e0a-9f85-c127152446c0:1", "relatedVariableGroupName": "115", "relatedVariableGroupLabel": "Administration", "relatedVariableGroupUrn": "urn:ddi:uk.closer:6767feb8-585f-4bf5-b9bd-d05a00419c24:1" },
{ "questionName": "qi_ConDNA", "questionSummary": "ASK RESPONDENT: May we have your consent to take a sample of your DNA from your blood, to be stored and used in scientific research?", "questionUrn": "urn:ddi:uk.iser.ukhls:878279fc-d12c-4a5a-8501-1b800796a387:1", "questionGroupName": "10301", "questionGroupLabel": "Cardiovascular system", "questionGroupUrn": "urn:ddi:uk.closer:40dc03fa-d3a1-4b5d-b115-e9f0af68755f:1", "relatedVariableName": "c_condna", "relatedVariableLabel": "consent to take a sample of your DNA", "relatedVariableUrn": "urn:ddi:uk.iser.ukhls:cc832d9e-c518-4820-a29d-cd732bd84a2f:1", "relatedVariableGroupName": "115", "relatedVariableGroupLabel": "Administration", "relatedVariableGroupUrn": "urn:ddi:uk.closer:6c868dcb-8bcb-4ec0-b4e8-fa6435828dca:1" },
{ "questionName": "qi_ConStorB", "questionSummary": "ASK RESPONDENT: May we have your consent to store the blood sample for future analysis? IF NECESSARY: Your blood will not be analysed immediately but will be available for scientific research in the future. Any analysis will have to be approved by an independent committee. The stored blood will not be available for commercial purposes. The blood will be stored at a secure storage facility; your name and address will not be attached to the sample.", "questionUrn": "urn:ddi:uk.iser.ukhls:c7e4ff73-672c-4e5f-a5b2-552dd2f09788:1", "questionGroupName": "10301", "questionGroupLabel": "Cardiovascular system", "questionGroupUrn": "urn:ddi:uk.closer:40dc03fa-d3a1-4b5d-b115-e9f0af68755f:1", "relatedVariableName": "b_constorb", "relatedVariableLabel": "consent to store the blood sample for future", "relatedVariableUrn": "urn:ddi:uk.iser.ukhls:54714fdc-3194-42f5-9797-1a7aac61433a:1", "relatedVariableGroupName": "115", "relatedVariableGroupLabel": "Administration", "relatedVariableGroupUrn": "urn:ddi:uk.closer:6767feb8-585f-4bf5-b9bd-d05a00419c24:1" }
];

var questionsMappedToMultipleGroupsJSON = [
  { "question": { "Summary": { "en-GB": "And what is your usual pay before any deductions for tax and National Insurance, including any overtime, bonus, commission, tips, etc., that you usually receive? Period" }, "ItemName": { "en-GB": "qi_currentjob_18_b_B" }, "Label": { "en-GB": "currentjob 18(b)" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "a1bb19bd-a24a-4443-8728-a6ad80eb42b8", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "486b9b26-b56f-4f90-a92b-ffd4bf85c5bb", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10903" }, "Label": { "en-GB": "Income" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 2, "Identifier": "dc48b4e3-9c3b-4cc2-9f54-291cd4202742", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10901" }, "Label": { "en-GB": "Occupation | Employment" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 2, "Identifier": "a78cf8d7-79b1-4e79-880d-eb0fd651c858", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] },
  { "question": { "Summary": { "en-GB": "What was this course called? What skill were you training for? PROBE FOR EXACT NAME OF COURSE INCLUDING SUBJECT AND LEVEL. WRITE IN FULLY." }, "ItemName": { "en-GB": "qi_apprenticeshipandtraining_29" }, "Label": { "en-GB": "apprenticeshipandtraining 29" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "a1bb19bd-a24a-4443-8728-a6ad80eb42b8", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "8cd1dcd8-16c7-4a56-9fae-fd7a02785f89", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10804" }, "Label": { "en-GB": "Training" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 2, "Identifier": "f5369389-50f2-45ec-befb-6633f1637d05", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10901" }, "Label": { "en-GB": "Occupation | Employment" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 2, "Identifier": "a78cf8d7-79b1-4e79-880d-eb0fd651c858", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] },
  { "question": { "Summary": { "en-GB": "What things in particular are you prevented from doing?" }, "ItemName": { "en-GB": "qi_othereducation_13" }, "Label": { "en-GB": "othereducation 13" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "a1bb19bd-a24a-4443-8728-a6ad80eb42b8", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "47cc775d-7e0b-4b0a-bb11-fd3aceb1223a", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10805" }, "Label": { "en-GB": "Basic skills" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 1, "Identifier": "700a68a6-19c1-42d7-90ba-1b9bf388c2ce", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10810" }, "Label": { "en-GB": "Cognitive skills" }, "Description": {}, "ItemType": "5cc915a1-23c9-4487-9613-779c62f8c205", "AgencyId": "uk.closer", "Version": 2, "Identifier": "23451616-9313-49dc-bad6-574a2f6ee930", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] }
];

var variablesMappedToMultipleGroupsJSON = [
  { "variable": { "Summary": {}, "ItemName": { "en-GB": "N622_5" }, "Label": { "en-GB": "Sex of Cohort Member" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "683889c6-f74b-4d5e-92ed-908c0a42bb2d", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "cfd1c528-1ca3-4373-aa18-d9b0a34cf79e", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "115" }, "Label": { "en-GB": "Administration" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 1, "Identifier": "04ddd6ef-f4d2-4cfe-95f2-758b83805205", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10102" }, "Label": { "en-GB": "Gender" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 2, "Identifier": "61d529d2-fb02-4e91-8e28-ec369a2f6321", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] },
  { "variable": { "Summary": {}, "ItemName": { "en-GB": "N5REGION" }, "Label": { "en-GB": "Standard region at NCDS5" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "683889c6-f74b-4d5e-92ed-908c0a42bb2d", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "5f323c1f-33dd-421b-ace0-d9ae887e2706", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "115" }, "Label": { "en-GB": "Administration" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 1, "Identifier": "04ddd6ef-f4d2-4cfe-95f2-758b83805205", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10106" }, "Label": { "en-GB": "Location" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 2, "Identifier": "d7c75ebf-93bc-483f-b4ee-c171c5ca748d", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] },
  { "variable": { "Summary": {}, "ItemName": { "en-GB": "N5GOR" }, "Label": { "en-GB": "NCDS5 Government Office Region" }, "Description": {}, "VersionRationale": {}, "MetadataRank": 0, "RepositoryName": null, "IsAuthoritative": false, "Tags": [], "ItemType": "683889c6-f74b-4d5e-92ed-908c0a42bb2d", "AgencyId": "uk.cls.ncds", "Version": 1, "Identifier": "7ec34d9b-5db8-4405-a147-7be0224bf01e", "Item": null, "Notes": null, "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "IsProvisional": false, "ItemFormat": "00000000-0000-0000-0000-000000000000", "TransactionId": 0, "VersionCreationType": 0 }, "groups": [{ "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "115" }, "Label": { "en-GB": "Administration" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 1, "Identifier": "04ddd6ef-f4d2-4cfe-95f2-758b83805205", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }, { "VersionRationale": {}, "Summary": {}, "ItemName": { "en-GB": "10106" }, "Label": { "en-GB": "Location" }, "Description": {}, "ItemType": "91da6c62-c2c2-4173-8958-22c518d1d40d", "AgencyId": "uk.closer", "Version": 2, "Identifier": "d7c75ebf-93bc-483f-b4ee-c171c5ca748d", "VersionDate": "0001-01-01T00:00:00", "VersionResponsibility": null, "IsPublished": false, "IsDeprecated": false, "Tags": [] }] }
];

var questionsMappedToNoGroupsJSON = [
  { "AgencyId": "uk.iser.ukhls", "Identifier": "901cea83-7de4-43ee-86ea-bc81ef581002", "ItemName": "qi_35", "Label": "35", "ItemDescription": "And how much do you weigh without clothes on? If you are not sure please write in your best guess. Please use either stones and pounds or kilograms – whichever you know the best. Stones ... Pounds ... Kilograms" },
  { "AgencyId": "uk.iser.ukhls", "Identifier": "75245394-bccd-4b01-ac48-c83dab464115", "ItemName": "qi_34", "Label": "34", "ItemDescription": "How tall are you without shoes? Please use either feet and Inches or metres and centimetres - whichever you know the best. Feet and Inches ... Metres and centimetres" },
  { "AgencyId": "uk.genscot", "Identifier": "72b1ef3e-236d-4f7d-b522-e51b35744d45", "ItemName": "qi_S2_ChildAge", "Label": "S2 ChildAge", "ItemDescription": "Please enter the age of each of your children." },
  { "AgencyId": "uk.lha", "Identifier": "1e27574c-9e58-441b-bf96-001cb22bfd05", "ItemName": "qi_10", "Label": "10", "ItemDescription": "Space to write in the Recipe or Ingredients of any made up dishes or foreign food that you have mentioned if not already done above" },
  { "AgencyId": "uk.cls.bcs70", "Identifier": "b84875e5-a162-4a3e-b581-02f8aa3e2f14", "ItemName": "qi_C11_a_i", "Label": "C11 a(i)", "ItemDescription": "How many times has this happened to you since you were 10 years of age? Up to 1 year ago" }
];

var variablesMappedToNoGroupsJSON = [
  { "AgencyId": "uk.whitehall2", "Identifier": "c46e61e2-4bff-40cc-a5f5-b8d5a1347912", "ItemName": "ID_RANDOM", "Label": "WHITEHALL-II ID FOR DPUK", "ItemDescription": "WHITEHALL-II ID FOR DPUK" }
];

var dashboardData = {
  "topicMismatches": topicMismatchesJSON,
  "questionsMappedToMultipleGroups": questionsMappedToMultipleGroupsJSON,
  "variablesMappedToMultipleGroups": variablesMappedToMultipleGroupsJSON,
  "questionsMappedToNoGroups": questionsMappedToNoGroupsJSON,
  "variablesMappedToNoGroups": variablesMappedToNoGroupsJSON
}

const tabNames = ["Question/variable topic mismatches",
  "Questions mapped to multiple topics",
  "Variables mapped to multiple topics",
  "Questions mapped to no topics",
  "Variables mapped to no topics"
]

const itemCountsPerAgency = getItemCountsTopicIssues(dashboardData)

window.scrollTo = jest.fn()

describe('load, display and interact with panels for topic related issues', () => {
  beforeEach(() => {
    ({ getByText } = render(<GenericDashboard
      data={dashboardData}
      tabNames={tabNames}
      panelContents={panelContentsTopicIssues}
      itemCounts={itemCountsPerAgency}
    />))
  });

  test('load, display and interact with panel for question/variable topic mismatches', async () => {
    await userEvent.click(screen.getByText('Question/variable topic mismatches'))
    expect(getByText('Question/variable topic mismatches')).toBeInTheDocument()
    expect(getByText('topicMismatches')).toBeInTheDocument()
    expect(getByText('uk.alspac')).toBeInTheDocument()
    expect(getByText('uk.genscot')).toBeInTheDocument()
    expect(getByText('uk.iser.ukhls')).toBeInTheDocument()
    await userEvent.click(screen.getByText('uk.alspac'))
    expect(getByText(
      'Summary: Do you think that you have, or have had, COVID-19?')).toBeInTheDocument()
  })

  test('load, display and interact with panel for questions mapped to multiple topics', async () => {
    await userEvent.click(screen.getByText('Questions mapped to multiple topics'))
    expect(getByText('questionsMappedToMultipleGroups')).toBeInTheDocument()
    expect(getByText('Questions mapped to multiple topics')).toBeInTheDocument()
    expect(getByText('uk.cls.ncds')).toBeInTheDocument()
    await userEvent.click(screen.getByText('uk.cls.ncds'))
    expect(getByText('Summary: What was this course called? What skill were you training for? PROBE FOR EXACT NAME OF COURSE INCLUDING SUBJECT AND LEVEL. WRITE IN FULLY.')
    ).toBeInTheDocument()
  })

  test('load, display and interact with panel for variables mapped to multiple topics', async () => {
    await userEvent.click(screen.getByText('Variables mapped to multiple topics'))
    expect(getByText('Question/variable topic mismatches')).toBeInTheDocument()
    expect(getByText('variablesMappedToMultipleGroups')).toBeInTheDocument()
    expect(getByText('uk.cls.ncds')).toBeInTheDocument()
    await userEvent.click(screen.getByText('uk.cls.ncds'))
    expect(getByText('NCDS5 Government Office Region')).toBeInTheDocument()
  })

  test('load, display and interact with panel for questions mapped to no topics', async () => {
    await userEvent.click(screen.getByText('Questions mapped to no topics'))
    expect(getByText('questionsMappedToNoGroups')).toBeInTheDocument()
    expect(getByText('uk.cls.bcs70')).toBeInTheDocument()
    expect(getByText('uk.genscotff')).toBeInTheDocument()
    expect(getByText('uk.iser.ukhls')).toBeInTheDocument()
    expect(getByText('uk.lha')).toBeInTheDocument()
    await userEvent.click(screen.getByText('uk.lha'))
    expect(getByText('Summary: Space to write in the Recipe or Ingredients of any made up dishes or foreign food that you have mentioned if not already done above')
    ).toBeInTheDocument()
  })

  test('load, display and interact with panel for variables mapped to no topics', async () => {
    await userEvent.click(screen.getByText('Variables mapped to no topics'))
    expect(getByText('Variables mapped to no topics')).toBeInTheDocument()
    expect(getByText('uk.whitehall2')).toBeInTheDocument()
    await userEvent.click(screen.getByText('uk.whitehall2'))
    expect(getByText('WHITEHALL-II ID FOR DPUK')).toBeInTheDocument()
  })
})
