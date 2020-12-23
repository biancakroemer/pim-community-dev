import React from 'react';
import {ThemeProvider} from 'styled-components';
import {Level, pimTheme, Table} from 'akeneo-design-system';
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

const getStepLabel = (step: StepExecution): string => {
  const translate = useTranslate();

  let key = 'batch_jobs.' + step.job + '.' + step.label + '.label';
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

// !TODO rewrite without BEM
const SummaryDetails = ({step}: SummaryDetailsProps) => {
  return (
    <table className="AknGrid AknGrid--condensed">
      {Object.keys(step.summary).map(key => (
        <tr className="AknGrid-bodyRow">
          <td className="AknGrid-bodyCell">{key}</td>
          <td className="AknGrid-bodyCell">{step.summary[key]}</td>
        </tr>
      ))}
    </table>
  )
};

type SummaryTableProps = {
  jobExecution: JobExecution;
}

const SummaryTable = ({jobExecution}: SummaryTableProps) => {
  const translate = useTranslate();

  if (!jobExecution.stepExecutions) return null;

  return (
    <Table>
      <Table.Header>
        <Table.HeaderCell>{translate('pim_import_export.form.job_execution.summary.header.step').toUpperCase()}</Table.HeaderCell>
        <Table.HeaderCell>{translate('pim_common.status').toUpperCase()}</Table.HeaderCell>
        <Table.HeaderCell>{translate('pim_import_export.form.job_execution.summary.header.summary').toUpperCase()}</Table.HeaderCell>
        <Table.HeaderCell>{translate('pim_import_export.form.job_execution.summary.header.start').toUpperCase()}</Table.HeaderCell>
        <Table.HeaderCell>{translate('pim_import_export.form.job_execution.summary.header.end').toUpperCase()}</Table.HeaderCell>
      </Table.Header>
      <Table.Body>
        {jobExecution.stepExecutions.map(step => (
          <Table.Row>
            <Table.Cell>{getStepLabel(step)}</Table.Cell>
            <Table.Cell>
              <Badge level={getStepStatusLevel(step)}>
                {step.status}
              </Badge>
            </Table.Cell>
            <Table.Cell>
              <SummaryDetails step={step}/>
            </Table.Cell>
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
