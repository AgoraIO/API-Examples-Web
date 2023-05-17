var $protobuf  = protobuf

var $protobufRoot = ($protobuf.roots.default || ($protobuf.roots.default = new $protobuf.Root()))
.addJSON({
  agora: {
    nested: {
      audio2text: {
        options: {
          java_package: "io.agora.rtc.audio2text",
          java_outer_classname: "Audio2TextProtobuffer"
        },
        nested: {
          Text: {
            fields: {
              vendor: {
                type: "int32",
                id: 1
              },
              version: {
                type: "int32",
                id: 2
              },
              seqnum: {
                type: "int32",
                id: 3
              },
              uid: {
                type: "uint32",
                id: 4
              },
              flag: {
                type: "int32",
                id: 5
              },
              time: {
                type: "int64",
                id: 6
              },
              lang: {
                type: "int32",
                id: 7
              },
              starttime: {
                type: "int32",
                id: 8
              },
              offtime: {
                type: "int32",
                id: 9
              },
              words: {
                rule: "repeated",
                type: "Word",
                id: 10
              },
              end_of_segment:{
                type: "bool",
                id: 11
              },
              duration_ms:{
                type: "int32",
                id: 12
              },
              data_type:{
                type: "string",
                id: 13
              },
              trans: {
                rule: "repeated",
                type: "Translation",
                id: 14
              },
            }
          },
          Word: {
            fields: {
              text: {
                type: "string",
                id: 1
              },
              startMs: {
                type: "int32",
                id: 2
              },
              durationMs: {
                type: "int32",
                id: 3
              },
              isFinal: {
                type: "bool",
                id: 4
              },
              confidence: {
                type: "double",
                id: 5
              }
            }
          },
          Translation:{
            fields: {
              isFinal: {
                type: "bool",
                id: 1
              },
              lang: {
                type: "string",
                id: 2
              },
              texts: {
                rule: "repeated",
                type: "string",
                id: 3
              }
            }
          }
        }
      }
    }
  }
});

window.$protobufRoot = $protobufRoot
