import React from 'react';
import styled, {ThemeProvider} from 'styled-components';
import {getColor, Level, pimTheme, Table} from 'akeneo-design-system';
import {ReactView} from '@akeneo-pim-community/legacy-bridge/src/bridge/react';
import {DependenciesProvider, useTranslate} from '@akeneo-pim-community/legacy-bridge';
import {Badge} from 'akeneo-design-system/lib/components/Badge/Badge';

type StepExecution = {
  endedAt: string;
  errors: any[];
  failures: any[];
  job: string;
  label: string;
  startedAt: string;
  status: string;
  summary: Record<string, number>;
  warnings: any[];
};
type JobExecution = {
  stepExecutions?: StepExecution[];
};

const getStepKey = (step: StepExecution) => {
  return 'batch_jobs.' + step.job + '.' + step.label + '.label';
};

const getStepLabel = (step: StepExecution): string => {
  const translate = useTranslate();

  let key = getStepKey(step);
  if (translate(key) === key) {
    key = 'batch_jobs.default_steps.' + step.label;
  }

  return translate(key);
};

const getStepStatusLevel = (step: StepExecution): Level => {
  if (step.errors.length > 0 || step.failures.length > 0) {
    return 'danger';
  }
  if (step.warnings.length > 0) {
    return 'warning';
  }
  return 'primary';
};

type SummaryDetailsProps = {
  step: StepExecution;
}

// TODO: use get color
const SummaryDetailsTable = styled(Table)`
  line-height: 20px;
  font-size: ${props => props.theme.fontSize.default};
  color: ${getColor('grey', 140)};

  tr:not(:last-child) {
    border-bottom: 1px solid ${getColor('grey', 60)};
  }
`

const SummaryDetailsCell = styled(Table.Cell)`
  padding: 6px 4px 6px 4px;
  border-width: 0px;
  text-transform: Capitalize;
`

// TODO: Extract in a dedicated file ?
const SummaryDetails = ({step}: SummaryDetailsProps) => {
  return (
    <SummaryDetailsTable>
      <Table.Body>
        {Object.keys(step.summary).map(key => (
          <Table.Row key={key}>
            <SummaryDetailsCell>{key}</SummaryDetailsCell>
            <SummaryDetailsCell>{step.summary[key]}</SummaryDetailsCell>
          </Table.Row>
        ))}
      </Table.Body>
    </SummaryDetailsTable>
  )
};

const SummaryCell = styled(Table.Cell)`
  padding: 0px 10px;
`
const SummaryHeaderCell = styled(Table.Cell)`
  text-transform: uppercase;
`

type SummaryTableProps = {
  jobExecution: JobExecution;
}
// TODO: To extract in a dedicated file
const SummaryTable = ({jobExecution}: SummaryTableProps) => {
  const translate = useTranslate();

  if (!jobExecution.stepExecutions) return null;

  console.log(jobExecution.stepExecutions);

  return (
    <Table>
      <Table.Header>
        <SummaryHeaderCell>{translate('pim_import_export.form.job_execution.summary.header.step')}</SummaryHeaderCell>
        <SummaryHeaderCell>{translate('pim_common.status')}</SummaryHeaderCell>
        <SummaryHeaderCell>{translate('pim_import_export.form.job_execution.summary.header.summary')}</SummaryHeaderCell>
        <SummaryHeaderCell>{translate('pim_import_export.form.job_execution.summary.header.start')}</SummaryHeaderCell>
        <SummaryHeaderCell>{translate('pim_import_export.form.job_execution.summary.header.end')}</SummaryHeaderCell>
      </Table.Header>
      <Table.Body>
        {jobExecution.stepExecutions.map(step => (
          <Table.Row key={getStepKey(step)}>
            <Table.Cell>{getStepLabel(step)}</Table.Cell>
            <Table.Cell>
              <Badge level={getStepStatusLevel(step)}>
                {step.status}
              </Badge>
            </Table.Cell>
            <SummaryCell>
              <SummaryDetails step={step}/>
            </SummaryCell>
            <Table.Cell>{step.startedAt}</Table.Cell>
            <Table.Cell>{step.endedAt}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

class SummaryTableView extends ReactView {
  /* istanbul ignore next */
  configure() {
    this.listenTo(this.getRoot(), 'pim_enrich:form:entity:post_update', this.render);

    return super.configure();
  }

  reactElementToMount() {
    const data = this.getRoot().getFormData() as JobExecution;

    return (
      <DependenciesProvider>
        <ThemeProvider theme={pimTheme}>
          <SummaryTable jobExecution={data}/>
        </ThemeProvider>
      </DependenciesProvider>
    );
  }

  /* istanbul ignore next */
  remove() {
    this.stopListening();

    return super.remove();
  }
}

export = SummaryTableView;
