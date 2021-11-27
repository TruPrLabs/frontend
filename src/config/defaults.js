import React, { Fragment } from 'react';
import { styled, TextField, Stack, Tooltip } from '@mui/material';
// import { withStyles } from '@mui/styles';

import DateTimePicker from '@mui/lab/DateTimePicker';

import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { LoadingButton } from '@mui/lab';

// const labelHoverStyle = () => ({
//   '&:hover': {
//     cursor: 'pointer',
//   },
// });

export const LabelWithText = ({
  label,
  text,
  variant = 'subtle',
  placement = 'left',
  tooltip,
  tooltipPlacement = 'left',
  textStyle = {},
}) => {
  return (
    <LabelWith
      label={label}
      variant={variant}
      placement={placement}
      tooltip={tooltip}
      tooltipPlacement={tooltipPlacement}
    >
      <div style={{ marginBlock: 'auto' }}>
        <Typography
          style={{
            textAlign: 'left',
            // fontWeight: 200,
            ...textStyle,
          }}
        >
          {text}
        </Typography>
      </div>
    </LabelWith>
  );
};

export const RowLabel = (props) => (
  <LabelWith tooltipPlacement="?" variant="standard" style={{ width: '100%', paddingTop: '1em' }} {...props} />
);

export const LabelWith = ({
  label,
  children,
  variant = 'subtle',
  tooltip,
  tooltipPlacement = 'label',
  placement = 'left',
  // align = 'left',
  style = {},
  labelStyle = {},
}) => {
  labelStyle = {
    // fontWeight: 200,
    ...(variant === 'subtle' && { color: 'subtle' }),
    ...(variant === 'subtle-small' && { color: 'subtle', fontSize: '14px' }),
    ...(placement === 'right' && { paddingLeft: '0.5em' }),
    ...(placement === 'left' && { paddingRight: '0.5em' }),
    ...labelStyle,
  };

  var labelElement = label && (
    <div
      style={{
        marginBlock: 'auto',
        display: 'inline-flex',
        cursor: 'default',
        ...(placement === 'top' && { width: '100%' }),
      }}
    >
      <Typography sx={{ textAlign: 'left', ...labelStyle }}>{label}</Typography>

      {tooltip && tooltipPlacement === '?' && (
        <Tooltip title={tooltip} placement="top" style={{ marginInline: '0.5em' }}>
          <Typography sx={{ ...labelStyle, color: '#9e9e9e' }}>?</Typography>
        </Tooltip>
      )}
    </div>
  );

  if (tooltip && tooltipPlacement === 'label')
    labelElement = label && (
      <Tooltip placement="top" title={tooltip}>
        {labelElement}
      </Tooltip>
    );

  if (tooltip && tooltipPlacement === 'children')
    children = (
      <Tooltip placement="top" title={tooltip}>
        {children}
      </Tooltip>
    );

  const labelPlacementBefore = placement === 'top' || placement === 'left';

  var component = (
    <Box
      sx={{
        marginBlock: 'auto',
        // textAlign: 'left', // remove textAlign for top-centered label
        // width: '100%',
        // display: 'inline-flex',
        ...((placement === 'left' || placement === 'right') && {
          display: 'inline-flex',
          flexWrap: 'wrap',
          // justifyContent: 'space-between',
          // justifyContent: 'right',
        }),
        ...style,
      }}
    >
      <Fragment>
        {/* <div style={{ display: 'inline-flex', marginBlock: 'auto', justifyContent: 'space-between' }}> */}
        {labelPlacementBefore && labelElement}
        {/* <div style={{ marginBlock: 'auto' }}>{children}</div> */}
        {children}
        {!labelPlacementBefore && labelElement}
      </Fragment>
    </Box>
  );

  if (tooltip && tooltipPlacement === 'component')
    component = (
      <Tooltip placement="top" title={tooltip}>
        {component}
      </Tooltip>
    );

  return component;
};

export const TransactionButton = (props) => {
  const button = (
    <LoadingButton
      variant="contained"
      {...props}
      loading={props.loading || undefined}
      tooltip={undefined}
      style={{ width: '100%', ...props.style }}
    />
  );

  if (props.tooltip)
    return (
      <Tooltip title={props.tooltip} placement="top">
        <Box component="span" style={{ ...(props.disabled && { cursor: 'not-allowed' }) }} loading={undefined}>
          {button}
        </Box>
      </Tooltip>
    );

  return button;
};

const StyledStack = styled(Stack)(({ theme }) => ({
  margin: '1em 0',
  padding: '1em 2em',
  maxWidth: 750,
  minWidth: 450,
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
}));

const StyleRow = styled(Stack)(({ theme }) => ({
  // margin: '1em 0',
  // padding: '1em 1em',
  // maxWidth: 600,
  // marginLeft: 'auto',
  // marginRight: 'auto',
  textAlign: 'center',
  width: '100%',
  // display: 'block',
  display: 'inline-flex',
  justifyContent: 'space-between',
  // margin: 'auto',
}));

export const Column = (props) => (
  <StyledStack className="glass-solid" sx={{ background: 'white' }} spacing={2} {...props} />
);

export const Row = (props) => <StyleRow spacing={4} direction="row" {...props} />;

export const StyledTextField = (props) => (
  <TextField
    variant="outlined"
    {...props}
    sx={{
      width: '240px',
      height: '3.4em',
      marginBlock: '0.5em',
      marginLeft: 'auto',
      ...props.sx,
    }}
  />
);

export const StyledTextFieldInfo = (props) => (
  <StyledTextField
    variant="standard"
    inputProps={{
      readOnly: true,
    }}
    style={
      {
        // '.MuiInput-underline:before': {
        //   borderBottom: '2px solid red',
        // },
        /* hover (double-ampersand needed for specificity reasons. */
        // && .MuiInput-underline:hover:before {
        //   border-bottom: 2px solid lightblue;
        // }
        // /* focused */
        // .MuiInput-underline:after {
        //   border-bottom: 2px solid red;
        // }
      }
    }
    {...props}
  />
);
export const DDateTimePicker = ({ error, helperText, ...props }) => (
  <DateTimePicker
    {...props}
    renderInput={(params) => (
      <StyledTextField
        sx={{
          // marginInline: '0em',
          marginBlock: 'auto',
          ...props.sx,
        }}
        {...params}
        error={error}
        helperText={helperText}
      />
    )}
  />
);
