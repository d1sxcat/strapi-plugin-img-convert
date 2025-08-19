import { useReducer, useEffect } from 'react';
import { Page, useNotification, useFetchClient, Layouts } from '@strapi/strapi/admin';
import {
  Box,
  Button,
  Flex,
  Grid,
  Toggle,
  SingleSelect,
  SingleSelectOption,
  Typography,
  Field,
  Divider,
} from '@strapi/design-system';
import { Check } from '@strapi/icons';
import isEqual from 'lodash/isEqual';
import { useIntl } from 'react-intl';
import { useMutation, useQuery, QueryClientProvider, QueryClient } from 'react-query';
import { UpdateSettings } from '../../../../shared/contracts/settings';
import { PERMISSIONS } from '../../constants';
import { getTranslation } from '../../utils/getTranslation';
import { init } from './init';
import { initialState, reducer } from './reducer';
import type { InitialState } from './reducer';

const queryClient = new QueryClient();

export const SettingsPage = () => {
  const { formatMessage } = useIntl();
  const { toggleNotification } = useNotification();
  const { get, put } = useFetchClient();

  const [{ initialData, modifiedData }, dispatch] = useReducer(reducer, initialState, init);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['img-convert', 'settings'],
    async queryFn() {
      const {
        data: { data },
      } = await get('/strapi-plugin-img-convert/settings');

      return data;
    },
  });

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'GET_DATA_SUCCEEDED',
        data,
      });
    }
  }, [data]);

  const isSaveButtonDisabled = isEqual(initialData, modifiedData);

  const { mutateAsync, isLoading: isSubmitting } = useMutation<
    UpdateSettings.Response['data'],
    UpdateSettings.Response['error'],
    UpdateSettings.Request['body']
  >(
    async (body) => {
      const { data } = await put('/strapi-plugin-img-convert/settings', body);

      return data;
    },
    {
      onSuccess() {
        refetch();

        toggleNotification({
          type: 'success',
          message: formatMessage({ id: 'notification.form.success.fields' }),
        });
      },
      onError(err) {
        console.error(err);
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSaveButtonDisabled) {
      return;
    }

    await mutateAsync(modifiedData!);
  };

  const handleChange = ({
    target: { name, value },
  }: {
    target: {
      name: keyof NonNullable<InitialState['initialData']>;
      value: string | boolean;
    };
  }) => {
    dispatch({
      type: 'ON_CHANGE',
      keys: name,
      value,
    });
  };

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main>
      <Page.Title>
        {formatMessage({
          id: getTranslation('page.title'),
          defaultMessage: 'Settings - Image Convert',
        })}
      </Page.Title>
      <form onSubmit={handleSubmit}>
        <Layouts.Header
          title={formatMessage({
            id: getTranslation('settings.header.label'),
            defaultMessage: 'Image Convert',
          })}
          primaryAction={
            <Button
              disabled={isSaveButtonDisabled}
              loading={isSubmitting}
              type="submit"
              startIcon={<Check />}
              size="S"
            >
              {formatMessage({
                id: 'global.save',
                defaultMessage: 'Save',
              })}
            </Button>
          }
          subtitle={formatMessage({
            id: getTranslation('settings.sub-header.label'),
            defaultMessage: 'Configure the settings for the Image Convert - Plugin',
          })}
        />
        <Layouts.Content>
          <Layouts.Root>
            <Flex direction="column" alignItems="stretch" gap={12}>
              <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
                <Flex direction="column" alignItems="stretch" gap={4}>
                  <Flex>
                    <Typography variant="delta" tag="h2">
                      {formatMessage({
                        id: getTranslation('settings.blockTitle'),
                        defaultMessage: 'Select Output Format / Disbale Plugin',
                      })}
                    </Typography>
                  </Flex>
                  <Grid.Root gap={6}>
                    <Grid.Item col={12} s={12} alignItems="stretch">
                      <Field.Root
                        hint={formatMessage({
                          id: getTranslation('settings.form.outputFormat.description'),
                          defaultMessage:
                            'Select the output format for image conversion. You can also disable the plugin. Note: AVIF formats will not be resized',
                        })}
                        name="convertTo"
                      >
                        <Field.Label>
                          {formatMessage({
                            id: getTranslation('settings.form.outputFormat.label'),
                            defaultMessage: 'Output Format',
                          })}
                        </Field.Label>
                        <SingleSelect
                          value={modifiedData?.convertTo}
                          onChange={(value: string) => {
                            handleChange({
                              target: { name: 'convertTo', value },
                            });
                          }}
                        >
                          <SingleSelectOption value="webp">.WEBP</SingleSelectOption>
                          <SingleSelectOption value="avif">.AVIF</SingleSelectOption>
                          <SingleSelectOption value="off">Disabled</SingleSelectOption>
                        </SingleSelect>
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={12} s={12} direction="column" alignItems="stretch">
                      <Flex direction="column" alignItems="stretch" gap={6}>
                        <Divider />
                        <Typography variant="delta" tag="h2">
                          {formatMessage({
                            id: getTranslation('settings.blockTitle.options'),
                            defaultMessage: 'Toggle Input Formats for Conversion',
                          })}
                        </Typography>
                      </Flex>
                    </Grid.Item>
                    <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                      <Field.Root
                        hint={formatMessage({
                          id: getTranslation('settings.form.jpeg.description'),
                          defaultMessage:
                            'Enable this option to convert JPEG images to the selected format.',
                        })}
                        name="convertFromJPEG"
                      >
                        <Field.Label>
                          {formatMessage({
                            id: getTranslation('settings.form.jpeg.label'),
                            defaultMessage: 'Convert JPEG Images',
                          })}
                        </Field.Label>
                        <Toggle
                          checked={modifiedData?.convertFromJPEG}
                          offLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.off-label',
                            defaultMessage: 'Off',
                          })}
                          onLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.on-label',
                            defaultMessage: 'On',
                          })}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange({
                              target: { name: 'convertFromJPEG', value: e.target.checked },
                            });
                          }}
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                      <Field.Root
                        hint={formatMessage({
                          id: getTranslation('settings.form.png.description'),
                          defaultMessage:
                            'Enable this option to convert PNG images to the selected format.',
                        })}
                        name="convertFromPNG"
                      >
                        <Field.Label>
                          {formatMessage({
                            id: getTranslation('settings.form.png.label'),
                            defaultMessage: 'Convert PNG Images',
                          })}
                        </Field.Label>
                        <Toggle
                          checked={modifiedData?.convertFromPNG}
                          offLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.off-label',
                            defaultMessage: 'Off',
                          })}
                          onLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.on-label',
                            defaultMessage: 'On',
                          })}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange({
                              target: { name: 'convertFromPNG', value: e.target.checked },
                            });
                          }}
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                    <Grid.Item col={6} s={12} direction="column" alignItems="stretch">
                      <Field.Root
                        hint={formatMessage({
                          id: getTranslation('settings.form.tiff.description'),
                          defaultMessage:
                            'Enable this option to convert TIFF images to the selected format.',
                        })}
                        name="convertFromTIFF"
                      >
                        <Field.Label>
                          {formatMessage({
                            id: getTranslation('settings.form.tiff.label'),
                            defaultMessage: 'Convert TIFF Images',
                          })}
                        </Field.Label>
                        <Toggle
                          checked={modifiedData?.convertFromTIFF}
                          offLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.off-label',
                            defaultMessage: 'Off',
                          })}
                          onLabel={formatMessage({
                            id: 'app.components.ToggleCheckbox.on-label',
                            defaultMessage: 'On',
                          })}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            handleChange({
                              target: { name: 'convertFromTIFF', value: e.target.checked },
                            });
                          }}
                        />
                        <Field.Hint />
                      </Field.Root>
                    </Grid.Item>
                  </Grid.Root>
                </Flex>
              </Box>
            </Flex>
          </Layouts.Root>
        </Layouts.Content>
      </form>
    </Page.Main>
  );
};

export const ProtectedSettingsPage = () => (
  <QueryClientProvider client={queryClient}>
    <Page.Protect permissions={PERMISSIONS.settings}>
      <SettingsPage />
    </Page.Protect>
  </QueryClientProvider>
);
