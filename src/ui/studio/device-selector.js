//; -*- mode: rjsx;-*-
/** @jsx jsx */
import { jsx } from 'theme-ui';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@theme-ui/components';

export default function DeviceSelector({ devices, handleChange, ...rest }) {
  function selectDevice({ target }) {
    handleChange(devices, target.value);
  }

  if (!devices || !devices.length) {
    return (
      <Box>
        <FontAwesomeIcon icon={faSpinner} spin />
      </Box>
    );
  }

  return (
      <select sx={{variant: 'styles.select'}} onChange={selectDevice} disabled={!(devices && devices.length > 1)} {...rest}>
      {devices &&
        devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
    </select>
  );
}
