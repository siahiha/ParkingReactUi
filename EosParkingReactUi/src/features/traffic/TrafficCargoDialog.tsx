import { useId } from 'react';
import { Alert, Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AppPopup } from '../../components/AppPopup';
import { recordValue as valueOf, type Language } from '../../utils/records';
import type { useTrafficCargo } from './useTrafficCargo';

type Props = { language: Language; cargo: ReturnType<typeof useTrafficCargo> };
export function TrafficCargoDialog({ language, cargo }: Props) {
  const { t } = useTranslation(undefined, { lng: language });
  const fieldId = useId();
  const isPersian = language === 'fa';
  const error = cargo.error ? t(`trafficCargo.${cargo.error}`) : '';
  return (<AppPopup dir={isPersian ? "rtl" : "ltr"} open={cargo.isOpen} onClose={() => {
          if (!cargo.busy) cargo.close();
        }} maxWidth="md" busy={cargo.busy} title={cargo.outbound
            ? t('trafficCargo.outboundTitle')
            : t('trafficCargo.inboundTitle')} actions={[
  { id: 'action-0', label: t('trafficWorkspace.cancel'), onClick: () => cargo.close(), disabled: cargo.busy },
  { id: 'action-1', label: t('trafficCargo.register'), variant: "contained", onClick: () => void cargo.save(), disabled: cargo.busy }
]}>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
              pt: 1,
            }}
          >
            <FormControl size="small">
              <InputLabel id={fieldId + '-direction'}>{t('trafficCargo.direction')}</InputLabel>
              <Select
                labelId={fieldId + '-direction'}
                label={t('trafficCargo.direction')}
                value={cargo.outbound ? "out" : "in"}
                onChange={(event) =>
                  cargo.setOutbound(event.target.value === "out")
                }
              >
                <MenuItem value="in">
                  {t('trafficCargo.inbound')}
                </MenuItem>
                <MenuItem value="out">
                  {t('trafficCargo.outbound')}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id={fieldId + '-driver'}>{t('trafficCargo.driver')}</InputLabel>
              <Select
                labelId={fieldId + '-driver'}
                label={t('trafficCargo.driver')}
                value={cargo.form.driverId}
                onChange={(event) =>
                  cargo.setForm((current) => ({
                    ...current,
                    driverId: event.target.value,
                  }))
                }
              >
                {cargo.data.drivers.map((item) => (
                  <MenuItem
                    key={String(valueOf(item, "Id"))}
                    value={String(valueOf(item, "Id"))}
                  >
                    {String(
                      valueOf(item, "FullName") ??
                        `${valueOf(item, "FirstName") ?? ""} ${valueOf(item, "LastName") ?? ""}`,
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id={fieldId + '-merchandise'}>{t('trafficCargo.merchandise')}</InputLabel>
              <Select
                labelId={fieldId + '-merchandise'}
                label={t('trafficCargo.merchandise')}
                value={cargo.form.merchandiseId}
                onChange={(event) =>
                  cargo.setForm((current) => ({
                    ...current,
                    merchandiseId: event.target.value,
                  }))
                }
              >
                {cargo.data.merchandises.map((item) => (
                  <MenuItem
                    key={String(valueOf(item, "Id"))}
                    value={String(valueOf(item, "Id"))}
                  >
                    {String(
                      valueOf(item, "MerchandiseTitle") ??
                        valueOf(item, "Title") ??
                        "",
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id={fieldId + '-origin'}>{t('trafficCargo.origin')}</InputLabel>
              <Select
                labelId={fieldId + '-origin'}
                label={t('trafficCargo.origin')}
                value={cargo.form.originId}
                onChange={(event) =>
                  cargo.setForm((current) => ({
                    ...current,
                    originId: event.target.value,
                  }))
                }
              >
                {cargo.data.companies.map((item) => (
                  <MenuItem
                    key={`origin-${String(valueOf(item, "SectionId"))}`}
                    value={String(valueOf(item, "SectionId"))}
                  >
                    {String(valueOf(item, "CompanyName") ?? "")} -{" "}
                    {String(valueOf(item, "SectionName") ?? "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel id={fieldId + '-destination'}>{t('trafficCargo.destination')}</InputLabel>
              <Select
                labelId={fieldId + '-destination'}
                label={t('trafficCargo.destination')}
                value={cargo.form.destinationId}
                onChange={(event) =>
                  cargo.setForm((current) => ({
                    ...current,
                    destinationId: event.target.value,
                  }))
                }
              >
                {cargo.data.companies.map((item) => (
                  <MenuItem
                    key={`destination-${String(valueOf(item, "SectionId"))}`}
                    value={String(valueOf(item, "SectionId"))}
                  >
                    {String(valueOf(item, "CompanyName") ?? "")} -{" "}
                    {String(valueOf(item, "SectionName") ?? "")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="number"
              label={t('trafficCargo.weight')}
              value={cargo.form.weight}
              onChange={(event) =>
                cargo.setForm((current) => ({
                  ...current,
                  weight: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              type="number"
              label={t('trafficCargo.count')}
              value={cargo.form.count}
              onChange={(event) =>
                cargo.setForm((current) => ({
                  ...current,
                  count: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              label={t('trafficCargo.reason')}
              value={cargo.form.reason}
              onChange={(event) =>
                cargo.setForm((current) => ({
                  ...current,
                  reason: event.target.value,
                }))
              }
            />
            <TextField
              size="small"
              multiline
              minRows={2}
              label={t('trafficCargo.description')}
              value={cargo.form.description}
              onChange={(event) =>
                cargo.setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Box>
        </AppPopup>);
}
