//; -*- mode: rjsx;-*-
import styled from 'styled-components/macro';

const Notification = styled.div`
  :not(:last-child) {
    margin-bottom: 1.5rem;
  }

  background-color: ${props => (props.isDanger ? '#ff3860' : 'whitesmoke')};
  color:  ${props => (props.isDanger ? '#fff' : 'currentColor')};
  border-radius: 4px;
  padding: 1.25rem 2.5rem 1.25rem 1.5rem;
  position: relative;
}
`;

export default Notification;
