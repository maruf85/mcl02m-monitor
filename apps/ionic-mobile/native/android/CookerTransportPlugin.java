package com.maruf.mcl02monitor;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

/**
 * Minimal UDP transport for the local MiIO device protocol.
 * This class only transports packets; it does not expose cooker control actions.
 * Never log packet contents because encrypted payloads and device credentials are sensitive.
 */
@CapacitorPlugin(name = "CookerTransport")
public class CookerTransportPlugin extends Plugin {
    private static final int MIIo_PORT = 54321;
    private static final int MAX_PACKET_BYTES = 1024;
    private DatagramSocket socket;
    private InetAddress deviceAddress;

    @PluginMethod
    public synchronized void open(PluginCall call) {
        String host = call.getString("host");
        Integer port = call.getInt("port", MIIo_PORT);
        if (host == null || host.trim().isEmpty()) {
            call.reject("A cooker IP address is required.");
            return;
        }
        if (port == null || port != MIIo_PORT) {
            call.reject("Only the MiIO UDP port 54321 is supported.");
            return;
        }
        try {
            closeSocket();
            deviceAddress = InetAddress.getByName(host.trim());
            socket = new DatagramSocket();
            socket.setSoTimeout(2500);
            JSObject result = new JSObject();
            result.put("opened", true);
            call.resolve(result);
        } catch (Exception error) {
            closeSocket();
            call.reject("Unable to open the local UDP connection.", error);
        }
    }

    @PluginMethod
    public synchronized void exchange(PluginCall call) {
        String packetHex = call.getString("packet");
        Integer timeoutMs = call.getInt("timeoutMs", 2500);
        if (socket == null || socket.isClosed() || deviceAddress == null) {
            call.reject("Open the cooker connection before exchanging packets.");
            return;
        }
        try {
            byte[] outgoing = decodeHex(packetHex);
            if (outgoing.length == 0 || outgoing.length > MAX_PACKET_BYTES) {
                call.reject("Packet size is invalid.");
                return;
            }
            int timeout = timeoutMs == null ? 2500 : Math.max(250, Math.min(timeoutMs, 10000));
            socket.setSoTimeout(timeout);
            DatagramPacket request = new DatagramPacket(outgoing, outgoing.length, deviceAddress, MIIo_PORT);
            socket.send(request);

            byte[] buffer = new byte[MAX_PACKET_BYTES];
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            socket.receive(response);

            byte[] received = new byte[response.getLength()];
            System.arraycopy(response.getData(), response.getOffset(), received, 0, response.getLength());
            JSObject result = new JSObject();
            result.put("payload", encodeHex(received));
            call.resolve(result);
        } catch (java.net.SocketTimeoutException timeout) {
            call.reject("The cooker did not respond before the timeout.");
        } catch (Exception error) {
            call.reject("UDP packet exchange failed.", error);
        }
    }

    @PluginMethod
    public synchronized void close(PluginCall call) {
        closeSocket();
        call.resolve();
    }

    private void closeSocket() {
        if (socket != null) {
            socket.close();
            socket = null;
        }
        deviceAddress = null;
    }

    private static byte[] decodeHex(String value) {
        if (value == null || value.isEmpty() || (value.length() % 2) != 0 || !value.matches("[0-9a-fA-F]+")) {
            throw new IllegalArgumentException("Packet must be an even-length hexadecimal string.");
        }
        byte[] output = new byte[value.length() / 2];
        for (int i = 0; i < output.length; i++) {
            output[i] = (byte) Integer.parseInt(value.substring(i * 2, i * 2 + 2), 16);
        }
        return output;
    }

    private static String encodeHex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) result.append(String.format("%02x", value & 0xff));
        return result.toString();
    }
}