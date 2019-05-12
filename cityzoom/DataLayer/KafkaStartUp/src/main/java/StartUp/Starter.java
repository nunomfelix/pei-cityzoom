package StartUp;

import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;

public class Starter {
    public static void main(String[] args) {

        String bootstrapServes = "0.0.0.0:2181";
        Properties properties = new Properties();
        properties.setProperty(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServes);
        AdminClient adminClient = AdminClient.create(properties);

        NewTopic topicsList[] = {
            new NewTopic("Streams", 3, (short) 2),
            new NewTopic("Values", 3, (short) 2),
            new NewTopic("Alarms", 3, (short) 2)
        };
        try {
            CreateTopicsResult rez = adminClient.createTopics(
                    Collections.singleton(new NewTopic("myTopic", Collections.singletonMap(0, Arrays.asList(0, 1, 2)))),
                    new CreateTopicsOptions().timeoutMs(10000)
            );
            System.out.println(rez.values().toString());
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

}
