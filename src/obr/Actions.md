
# Actions that are interesting to the agent:

- OBR.notification :
  - [x] show:
    - message   `string`  The message to show in the notification
    - variant   `"DEFAULT" | "ERROR" | "INFO" | "SUCCESS" | "WARNING"`    An optional style variant for the notification

- OBR.room :
  - [x] getMetada   Get the current metadata for this room. 
  - [x] setMetadata `Partial<Metadata>`	A partial update to this rooms metadata. The included values will be spread among the current metadata to avoid overriding other values.Update the metadata for this room. [Needs further refinement for its future use but works for now]


