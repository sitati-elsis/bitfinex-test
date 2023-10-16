### Client Side

- Input validation is missing, user must use the format below
  - Ask <amount> <price> or Bid <amount> <price>
- Clients doesn't have exit command
- Client can't recover if server crushes

### Server Side

- No Input validation, client mistake crushes server
- Match logic isn't implemented
- Supports 2000 clients only, limited to port 3000 - 5000
- Doesn't allow clients to reconnect, incase they crush
- Has port exhaustion issue, we don't clean up client disconnects
- Logic for marching has not been implemented
